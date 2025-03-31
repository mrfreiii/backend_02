import { ObjectId, SortDirection, WithId } from "mongodb";
import { injectable } from "inversify";

import { WithPaginationType } from "../../types";
import { userCollection } from "../../db/mongodb";
import { UserDbType, UserViewType } from "./types";
import { UserQueryType } from "../../routers/usersRouter/types";

@injectable()
export class UsersQueryRepository {
   async getAllUsers(parsedQuery: UserQueryType): Promise<WithPaginationType<UserViewType>> {
        const {
            sortBy,
            sortDirection,
            pageSize,
            pageNumber,
            searchLoginTerm,
            searchEmailTerm
        } = parsedQuery;
        let filter: any = {};

        if (searchLoginTerm || searchEmailTerm) {
            const loginTerm = searchLoginTerm ? [{"accountData.login": {$regex: searchLoginTerm, $options: "i"}}] : [];
            const emailTerm = searchEmailTerm ? [{"accountData.email": {$regex: searchEmailTerm, $options: "i"}}] : [];

            filter = {
                $or: [ ...loginTerm, ...emailTerm ]
            }
        }

        const allUsers = await userCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const userCount = await this.getUsersCount(filter);

        return {
            pagesCount: Math.ceil(userCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: userCount,
            items: allUsers?.map((user) => this._mapUserDbTypeToUserViewType(user))
        }
    }

    async getUsersCount(filter: any): Promise<number> {
        return userCollection.countDocuments(filter);
    }

    async getUserById(id: string): Promise<UserViewType | undefined> {
        try {
            const user = await userCollection.findOne({_id: new ObjectId(id)});
            if (!user) {
                return;
            }

            return this._mapUserDbTypeToUserViewType(user);
        } catch {
            return;
        }
    }

    _mapUserDbTypeToUserViewType(user: WithId<UserDbType>): UserViewType {
        const {_id, accountData} = user;

        return {
            id: _id.toString(),
            email: accountData.email,
            login: accountData.login,
            createdAt: accountData.createdAt,
        }
    }
}
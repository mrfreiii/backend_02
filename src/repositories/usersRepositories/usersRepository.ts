import { ObjectId, WithId } from "mongodb";

import { UserDbType } from "./types";
import { userCollection } from "../../db/mongodb";

export const usersRepository = {
    clearDB: async () => {
        return userCollection.drop();
    },
    getUsersByEmailOrLogin: async (
        {
            email,
            login
        }: {
            email?: string,
            login?: string
        }): Promise<WithId<UserDbType> | null> => {
        if (!email && !login) {
            return null
        }

        const emailTerm = email ? [{
            "accountData.email": {
                $regex: email,
                $options: "i"
            }
        }] : [];
        const loginTerm = login ? [{
            "accountData.login": {
                $regex: login,
                $options: "i"
            }
        }] : [];

        const filter = {$or: [...loginTerm, ...emailTerm]}

        return userCollection.findOne(filter)
    },
    addNewUser: async (
        newUser: UserDbType
    ): Promise<string> => {
        try {
            const createdUser = await userCollection.insertOne(newUser);
            return createdUser?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    deleteUserById: async (id: string): Promise<boolean> => {
        try {
            const result = await userCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    },
    getUserByConfirmationCode: async (code: string): Promise<WithId<UserDbType> | null> => {
        const filter = {"emailConfirmation.confirmationCode": code}

        return userCollection.findOne(filter)
    },
    updateUserConfirmationStatus: async (userId: ObjectId): Promise<boolean> => {
        try {
            const result = await userCollection.updateOne(
                {_id: userId},
                {$set: {"emailConfirmation.confirmationStatus": "confirmed"}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    },
    updateUserConfirmationCodeAndExpirationDate: async (
        {
            userId,
            updatedUserConfirmation
        }: {
            userId: ObjectId,
            updatedUserConfirmation: {confirmationCode: string, expirationDate: number, confirmationStatus: "notConfirmed" | "confirmed"}
        }
    ): Promise<boolean> => {
        try {
            const result = await userCollection.updateOne(
                {_id: userId},
                {$set: {emailConfirmation: updatedUserConfirmation}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    },
    getUserById: async (id: string): Promise<WithId<UserDbType> | null> => {
        try {
            return userCollection.findOne({_id: new ObjectId(id)});
        } catch {
            return null;
        }
    },
    updateRefreshTokensBlackList: async ({userId, updatedBlackList}:{userId: string; updatedBlackList: string[]}): Promise<boolean> => {
        try {
            const result = await userCollection.updateOne(
                {_id: new ObjectId(userId)},
                {$set: {"tokens.refreshTokenBlackList": updatedBlackList}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    },
}
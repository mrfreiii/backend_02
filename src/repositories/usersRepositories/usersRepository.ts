import { ObjectId, WithId } from "mongodb";
import { injectable } from "inversify";

import { UserDbType } from "./types";
import { userCollection } from "../../db/mongodb";

@injectable()
export class UsersRepository {
    static async clearDB() {
        return userCollection.drop();
    }

    async getUsersByEmailOrLogin(
        {
            email,
            login
        }: {
            email?: string,
            login?: string
        }): Promise<WithId<UserDbType> | null> {
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
    }

    async addNewUser(
        newUser: UserDbType
    ): Promise<string> {
        try {
            const createdUser = await userCollection.insertOne(newUser);
            return createdUser?.insertedId?.toString();
        } catch {
            return ""
        }
    }

    async deleteUserById(id: string): Promise<boolean> {
        try {
            const result = await userCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }

    async getUserByConfirmationCode(code: string): Promise<WithId<UserDbType> | null> {
        const filter = {"emailConfirmation.confirmationCode": code}

        return userCollection.findOne(filter)
    }

    async updateUserConfirmationStatus(userId: ObjectId): Promise<boolean> {
        try {
            const result = await userCollection.updateOne(
                {_id: userId},
                {$set: {"emailConfirmation.confirmationStatus": "confirmed"}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async updateUserConfirmationCodeAndExpirationDate(
        {
            userId,
            updatedUserConfirmation
        }: {
            userId: ObjectId,
            updatedUserConfirmation: {
                confirmationCode: string,
                expirationDate: number,
                confirmationStatus: "notConfirmed" | "confirmed"
            }
        }
    ): Promise<boolean> {
        try {
            const result = await userCollection.updateOne(
                {_id: userId},
                {$set: {emailConfirmation: updatedUserConfirmation}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async updateUserPasswordRecoveryInfo(
        {
            userId,
            passwordRecoveryInfo,
        }: {
            userId: ObjectId,
            passwordRecoveryInfo: {
                recoveryCode: string,
                expirationDate: number
            }
        }): Promise<boolean> {
        try {
            const result = await userCollection.updateOne(
                {_id: userId},
                {$set: {passwordRecovery: passwordRecoveryInfo}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }
}
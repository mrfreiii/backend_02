import { injectable } from "inversify";
import { ObjectId, WithId } from "mongodb";

import { UserDbType } from "./types";
import { UserModel } from "../../models/userModel/user.entity";

@injectable()
export class UsersRepository {
    async clearDB() {
        return UserModel.collection.drop();
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

        return UserModel.findOne(filter)
    }

    async addNewUser(
        newUser: UserDbType
    ): Promise<string> {
        try {
            const createdUser = await UserModel.create(newUser);
            return createdUser?._id?.toString();
        } catch {
            return ""
        }
    }

    async deleteUserById(id: string): Promise<boolean> {
        try {
            const result = await UserModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }

    async getUserByConfirmationCode(code: string): Promise<WithId<UserDbType> | null> {
        const filter = {"emailConfirmation.confirmationCode": code}

        return UserModel.findOne(filter)
    }

    async updateUserConfirmationStatus(userId: ObjectId): Promise<boolean> {
        try {
            const result = await UserModel.updateOne(
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
            const result = await UserModel.updateOne(
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
            const result = await UserModel.updateOne(
                {_id: userId},
                {$set: {passwordRecovery: passwordRecoveryInfo}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async getUserByPasswordRecoveryCode(code: string): Promise<WithId<UserDbType> | null> {
        const filter = {"passwordRecovery.recoveryCode": code}

        return UserModel.findOne(filter)
    }

    async updateUserPasswordHash(
        {
            userId,
            passwordHash
        }: {
            userId: ObjectId;
            passwordHash: string
        }): Promise<boolean> {
        try {
            const result = await UserModel.updateOne(
                {_id: userId},
                {$set: {"accountData.passwordHash": passwordHash}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async getUserById(id: string): Promise<UserDbType | null> {
        try {
            return UserModel.findOne({_id: new ObjectId(id)});
        } catch {
            return null;
        }
    }
}
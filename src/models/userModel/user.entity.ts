import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { UserDbType } from "../../repositories/usersRepositories/types";

type UserModel = Model<UserDbType>;
// export type UserDocument = HydratedDocument<UserDbType>;

enum ConfirmationStatusEnum {
    Confirmed = "confirmed",
    NotConfirmed = "notConfirmed",
}

const userSchema = new mongoose.Schema<UserDbType>({
    accountData: {
        login: { type: String, required: true },
        email: { type: String, required: true },
        createdAt: { type: String, required: true },
        passwordHash: { type: String, required: true },
    },
    emailConfirmation: {
        confirmationCode: { type: String || null},
        expirationDate: { type: Number || null},
        confirmationStatus: { type: String, enum: ConfirmationStatusEnum },
    },
    passwordRecovery: {
        recoveryCode: { type: String },
        expirationDate:  { type: Number },
    }
})
export const UserModel = model<UserDbType, UserModel>(SETTINGS.PATH.USERS, userSchema)
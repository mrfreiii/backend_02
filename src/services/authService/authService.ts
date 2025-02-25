import { add } from "date-fns";
import { WithId } from "mongodb";
import { v4 as uuidv4 } from "uuid";

import { ResultStatus, ResultType } from "../types";
import { bcryptService } from "../bcryptService/bcryptService";
import { usersRepository } from "../../repositories/usersRepositories";
import { UserDbType } from "../../repositories/usersRepositories/types";
import { nodemailerService } from "../nodemailerService/nodemailerService";

export const authService = {
    checkCredentials: async (
        {
            loginOrEmail,
            password
        }: {
            loginOrEmail: string,
            password: string
        }): Promise<ResultType<WithId<UserDbType> | null>> => {
        const user = await usersRepository.getUsersByEmailOrLogin({
            login: loginOrEmail,
            email: loginOrEmail
        })
        if (!user) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: "неверный логин или пароль",
                extensions: [],
                data: null,
            }
        }

        const userPasswordSalt = user.accountData.passwordHash.substring(0, 29);
        const hashForValidation = await bcryptService.generateHash({
            salt: userPasswordSalt,
            password
        });

        if (hashForValidation !== user.accountData.passwordHash) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: "неверный логин или пароль",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: user,
        }
    },
    resendRegistrationEmail: async (
        {
            email,
            confirmationURL,
        }: {
            email: string;
            confirmationURL: string;
        }
    ): Promise<ResultType> => {
        const user = await usersRepository.getUsersByEmailOrLogin({email});
        if (!user) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "пользователь не найден",
                extensions: [
                    {field: "email", message: "user not found"}
                ],
                data: null,
            }
        }

        if (user.emailConfirmation.confirmationStatus === "confirmed") {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "пользователь уже подтверден",
                extensions: [
                    {field: "email", message: "user already confirmed"}
                ],
                data: null,
            }
        }

        const updatedUserConfirmation: { confirmationCode: string, expirationDate: number, confirmationStatus: "notConfirmed" | "confirmed" } = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                minutes: 2,
            }).getTime(),
            confirmationStatus: "notConfirmed"

        };

        const isUpdated = await usersRepository.updateUserConfirmationCodeAndExpirationDate({
            userId: user._id,
            updatedUserConfirmation
        });
        if (!isUpdated) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось обновить пользователя",
                extensions: [
                    {field: "email", message: "user confirmation update failed"}
                ],
                data: null,
            }
        }

        nodemailerService.sendEmailWithConfirmationCode({
            email,
            confirmationCode: updatedUserConfirmation.confirmationCode,
            confirmationURL,
        }).catch((err: any) => {
            console.log(`Sending registration email error: ${err}`)
        })

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        };
    },
}
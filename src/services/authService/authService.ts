import { add } from "date-fns";
import { WithId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";

import { ResultStatus, ResultType } from "../types";
import { UsersRepository } from "../../repositories/usersRepositories";
import { UserDbType } from "../../repositories/usersRepositories/types";
import { BcryptService } from "../bcryptService/bcryptService";
import { NodemailerService } from "../nodemailerService/nodemailerService";

@injectable()
export class AuthService {
    constructor(@inject(UsersRepository) private usersRepository: UsersRepository,
                @inject(BcryptService) private bcryptService: BcryptService,
                @inject(NodemailerService) private nodemailerService: NodemailerService) {
    }

    async checkCredentials(
        {
            loginOrEmail,
            password
        }: {
            loginOrEmail: string,
            password: string
        }): Promise<ResultType<WithId<UserDbType> | null>> {
        const user = await this.usersRepository.getUsersByEmailOrLogin({
            login: loginOrEmail,
            email: loginOrEmail
        })
        if (!user) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: "неверный логин или пароль",
                extensions: [],
                data: null,
            }
        }

        const userPasswordSalt = user.accountData.passwordHash.substring(0, 29);
        const hashForValidation = await this.bcryptService.generateHash({
            salt: userPasswordSalt,
            password
        });

        if (hashForValidation !== user.accountData.passwordHash) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: "неверный логин или пароль",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success_200,
            extensions: [],
            data: user,
        }
    }

    async confirmRegistration(code: string): Promise<ResultType<null>> {
        const user = await this.usersRepository.getUserByConfirmationCode(code);
        if (!user) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "неверный код",
                extensions: [
                    {field: "code", message: "invalid confirmation code"}
                ],
                data: null,
            }
        }

        if (user.emailConfirmation.expirationDate! < new Date().getTime()) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "время жизни кода истекло",
                extensions: [
                    {field: "code", message: "code expired"}
                ],
                data: null,
            }
        }

        if (user.emailConfirmation.confirmationStatus === "confirmed") {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "пользователь уже подтвержден",
                extensions: [
                    {field: "code", message: "code already confirmed"}
                ],
                data: null,
            }
        }

        const isStatusUpdated = this.usersRepository.updateUserConfirmationStatus(user._id);
        if (!isStatusUpdated) {
            return {
                status: ResultStatus.ServerError_500,
                errorMessage: "не удалось обновить статус регистрации",
                extensions: [
                    {field: "code", message: "failed updating confirmation status"}
                ],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success_200,
            extensions: [],
            data: null,
        };
    }

    async resendRegistrationEmail(
        {
            email,
            currentURL,
        }: {
            email: string;
            currentURL: string;
        }
    ): Promise<ResultType> {
        const user = await this.usersRepository.getUsersByEmailOrLogin({email});
        if (!user) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "пользователь не найден",
                extensions: [
                    {field: "email", message: "user not found"}
                ],
                data: null,
            }
        }

        if (user.emailConfirmation.confirmationStatus === "confirmed") {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "пользователь уже подтверден",
                extensions: [
                    {field: "email", message: "user already confirmed"}
                ],
                data: null,
            }
        }

        const updatedUserConfirmation: {
            confirmationCode: string,
            expirationDate: number,
            confirmationStatus: "notConfirmed" | "confirmed"
        } = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {
                minutes: 2,
            }).getTime(),
            confirmationStatus: "notConfirmed"

        };

        const isUpdated = await this.usersRepository.updateUserConfirmationCodeAndExpirationDate({
            userId: user._id,
            updatedUserConfirmation
        });
        if (!isUpdated) {
            return {
                status: ResultStatus.ServerError_500,
                errorMessage: "не удалось обновить пользователя",
                extensions: [
                    {field: "email", message: "user confirmation update failed"}
                ],
                data: null,
            }
        }

        this.nodemailerService.sendEmailWithConfirmationCode({
            email,
            confirmationCode: updatedUserConfirmation.confirmationCode,
            currentURL,
        }).catch((err: any) => {
            console.log(`Sending registration email error: ${err}`)
        })

        return {
            status: ResultStatus.Success_200,
            extensions: [],
            data: null,
        };
    }

    async recoverPassword(
        {
            email,
            currentURL,
        }: {
            email: string;
            currentURL: string;
        }): Promise<undefined> {
        const user = await this.usersRepository.getUsersByEmailOrLogin({email});
        if (!user) {
            return;
        }

        const passwordRecoveryInfo: { recoveryCode: string, expirationDate: number } = {
            recoveryCode: uuidv4(),
            expirationDate: add(new Date(), {
                minutes: 2,
            }).getTime(),
        };

        const isUpdated = await this.usersRepository.updateUserPasswordRecoveryInfo({
            userId: user._id,
            passwordRecoveryInfo,
        });
        if (!isUpdated) {
            return;
        }

        this.nodemailerService.sendEmailWithPasswordRecoveryCode({
            email,
            recoveryCode: passwordRecoveryInfo.recoveryCode,
            currentURL,
        }).catch((err: any) => {
            console.log(`Sending password recovery email error: ${err}`)
        })
    }

    async confirmPasswordRecovery(
        {
            newPassword,
            recoveryCode
        }: {
            newPassword: string;
            recoveryCode: string
        }): Promise<ResultType<null>> {
        const user = await this.usersRepository.getUserByPasswordRecoveryCode(recoveryCode);
        if (!user) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "код не найден",
                extensions: [
                    {field: "recoveryCode", message: "code not found"}
                ],
                data: null,
            }
        }

        if (user.passwordRecovery!.expirationDate < new Date().getTime()) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: "время жизни кода истекло",
                extensions: [
                    {field: "recoveryCode", message: "code expired"}
                ],
                data: null,
            }
        }

        const passwordHash = await this.bcryptService.generateHash({
            password: newPassword
        });

        const isHashUpdated = this.usersRepository.updateUserPasswordHash({
            userId: user._id,
            passwordHash
        });
        if (!isHashUpdated) {
            return {
                status: ResultStatus.ServerError_500,
                errorMessage: "не удалось обновить пароль",
                extensions: [
                    {field: "code", message: "failed updating user password"}
                ],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success_200,
            extensions: [],
            data: null,
        };
    }
}
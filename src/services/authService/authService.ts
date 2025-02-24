import { WithId } from "mongodb";

import { ResultStatus, ResultType } from "../types";
import { bcryptService } from "../bcryptService/bcryptService";
import { usersRepository } from "../../repositories/usersRepositories";
import { UserDbType } from "../../repositories/usersRepositories/types";

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
        if(!user){
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: "неверный логин или пароль",
                extensions: [],
                data: null,
            }
        }

        const userPasswordSalt = user.accountData.passwordHash.substring(0, 29);
        const hashForValidation = await bcryptService.generateHash({salt: userPasswordSalt, password});

        if(hashForValidation !== user.accountData.passwordHash){
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
}
import { WithId } from "mongodb";

import { ResultStatus, ResultType } from "../types";
import { bcryptService } from "../bcryptService/bcryptService";
import { UserDbType } from "../../repositories/usersRepositories/types";
import { usersRepository } from "../../repositories/usersRepositories/usersRepository";

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

        const hashForValidation = await bcryptService.generateHash({salt: user.passwordSalt, password});
        if(hashForValidation !== user.passwordHash){
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
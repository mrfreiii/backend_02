import { WithId } from "mongodb";
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
        }): Promise<WithId<UserDbType> | undefined> => {
        const user = await usersRepository.getUsersByEmailOrLogin({
            login: loginOrEmail,
            email: loginOrEmail
        })
        if(!user){
            return;
        }

        const hashForValidation = await bcryptService.generateHash({salt: user.passwordSalt, password});
        if(hashForValidation !== user.passwordHash){
            return;
        }

        return user;
    },
}
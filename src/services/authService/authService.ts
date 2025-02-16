import { bcryptService } from "../bcryptService/bcryptService";
import { usersRepository } from "../../repositories/usersRepositories/usersRepository";

export const authService = {
    loginUser: async (
        {
            loginOrEmail,
            password
        }: {
            loginOrEmail: string,
            password: string
        }): Promise<boolean> => {
        const user = await usersRepository.getUsersByEmailOrLogin({
            login: loginOrEmail,
            email: loginOrEmail
        })
        if(!user){
            return false;
        }

        const hashForValidation = await bcryptService.generateHash({salt: user.passwordSalt, password});
        return hashForValidation === user.passwordHash;
    },
}
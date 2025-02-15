import bcrypt from "bcrypt";

import { bcryptService } from "../bcryptService/bcryptService";
import { UserDbType, UserViewType } from "../../repositories/usersRepositories/types";
import { usersRepository } from "../../repositories/usersRepositories/usersRepository";

export const usersService = {
    addNewUser: async (
        dto: { login: string; email: string; password: string, errorsMessages: { field: keyof UserViewType, message: string }[] }
    ): Promise<string | undefined> => {
        const {login, email, password, errorsMessages} = dto;

        const anotherUserWithSameLogin = await usersRepository.getUsersByEmailOrLogin({login});
        if (anotherUserWithSameLogin) {
            errorsMessages.push({field: "login", message: "login should be unique"})
            return;
        }

        const anotherUserWithSameEmail = await usersRepository.getUsersByEmailOrLogin({email});
        if (anotherUserWithSameEmail) {
            errorsMessages.push({field: "email", message: "email should be unique"})
            return;
        }

        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcryptService.generateHash({password, salt: passwordSalt});

        const newUser: UserDbType = {
            email,
            login,
            passwordSalt,
            passwordHash,
            createdAt: (new Date()).toISOString(),
        };

        return usersRepository.addNewUser(newUser);
    },
    deleteUserById: async (id: string): Promise<boolean> => {
        return usersRepository.deleteUserById(id);
    },
}
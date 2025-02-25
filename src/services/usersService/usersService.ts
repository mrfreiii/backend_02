import bcrypt from "bcrypt";
import { add } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

import { ResultStatus, ResultType } from "../types";
import { bcryptService } from "../bcryptService/bcryptService";
import { usersRepository } from "../../repositories/usersRepositories";
import { UserDbType } from "../../repositories/usersRepositories/types";
import { nodemailerService } from "../nodemailerService/nodemailerService";

export const usersService = {
    addNewUser: async (
        dto: {
            login: string;
            email: string;
            password: string;
            needEmailConfirmation?: boolean;
            confirmationURL?: string
        }
    ): Promise<ResultType<string | null>> => {
        const {login, email, password, needEmailConfirmation, confirmationURL} = dto;

        const anotherUserWithSameLogin = await usersRepository.getUsersByEmailOrLogin({login});
        if (anotherUserWithSameLogin) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "пользователь с таких логином уже существует",
                extensions: [
                    {field: "login", message: "login already exist"}
                ],
                data: null,
            }
        }

        const anotherUserWithSameEmail = await usersRepository.getUsersByEmailOrLogin({email});
        if (anotherUserWithSameEmail) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "пользователь с такой почтой уже существует",
                extensions: [
                    {field: "email", message: "email already exist"}
                ],
                data: null,
            }
        }

        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcryptService.generateHash({password, salt: passwordSalt});

        const newUser: UserDbType = {
            accountData: {
                email,
                login,
                passwordHash,
                createdAt: (new Date()).toISOString(),
            },
            emailConfirmation: {
                confirmationCode: needEmailConfirmation ? uuidv4() : null,
                expirationDate: needEmailConfirmation ? add(new Date(),{
                    minutes: 2,
                }).getTime() : null,
                confirmationStatus: needEmailConfirmation ? "notConfirmed" : "confirmed"
            }
        };

        const createdUserId = await usersRepository.addNewUser(newUser);

        if(needEmailConfirmation && confirmationURL){
            nodemailerService.sendEmailWithConfirmationCode({
                email: newUser.accountData.email,
                confirmationCode: newUser.emailConfirmation.confirmationCode!,
                confirmationURL,
            }).catch((err: any) => {
                console.log(`Sending registration email error: ${err}`)
            })
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: createdUserId,
        };
    },
    deleteUserById: async (id: string): Promise<boolean> => {
        return usersRepository.deleteUserById(id);
    },
    confirmRegistration: async (code: string): Promise<ResultType<null>> => {
        const user = await usersRepository.getUserByConfirmationCode(code);
        if(!user){
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "неверный код",
                extensions: [
                    {field: "code", message: "invalid confirmation code"}
                ],
                data: null,
            }
        }

        if(user.emailConfirmation.expirationDate! < new Date().getTime()){
            return {
                status: ResultStatus.BadRequest,
                errorMessage: "время жизни кода истекло",
                extensions: [
                    {field: "code", message: "code expired"}
                ],
                data: null,
            }
        }

        if(user.emailConfirmation.confirmationStatus === "notConfirmed"){
            const isStatusUpdated = usersRepository.updateUserConfirmationStatus(user._id);
            if(!isStatusUpdated){
                return {
                    status: ResultStatus.BadRequest,
                    errorMessage: "не удалось обновить статус регистрации",
                    extensions: [
                        {field: "code", message: "failed updating confirmation status"}
                    ],
                    data: null,
                }
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        };
    }
}
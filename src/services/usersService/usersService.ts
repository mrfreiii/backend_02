import bcrypt from "bcrypt";
import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";

import { ResultStatus, ResultType } from "../types";
import { UserDbType } from "../../repositories/usersRepositories/types";
import { BcryptService } from "../bcryptService/bcryptService";
import { NodemailerService } from "../nodemailerService/nodemailerService";
import { UsersRepository } from "../../repositories/usersRepositories";

@injectable()
export class UsersService {
    constructor(@inject(UsersRepository) private usersRepository: UsersRepository,
                @inject(BcryptService) private bcryptService: BcryptService,
                @inject(NodemailerService) private nodemailerService: NodemailerService) {}

    async addNewUser(
        dto: {
            login: string;
            email: string;
            password: string;
            needEmailConfirmation?: boolean;
            currentURL?: string
        }
    ): Promise<ResultType<string | null>> {
        const {login, email, password, needEmailConfirmation, currentURL} = dto;

        const anotherUserWithSameLogin = await this.usersRepository.getUsersByEmailOrLogin({login});
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

        const anotherUserWithSameEmail = await this.usersRepository.getUsersByEmailOrLogin({email});
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

        const passwordHash = await this.bcryptService.generateHash({
            password,
        });

        const newUser: UserDbType = {
            accountData: {
                email,
                login,
                passwordHash,
                createdAt: (new Date()).toISOString(),
            },
            emailConfirmation: {
                confirmationCode: needEmailConfirmation ? uuidv4() : null,
                expirationDate: needEmailConfirmation ? add(new Date(), {
                    minutes: 2,
                }).getTime() : null,
                confirmationStatus: needEmailConfirmation ? "notConfirmed" : "confirmed"
            }
        };

        const createdUserId = await this.usersRepository.addNewUser(newUser);

        if (needEmailConfirmation && currentURL) {
            this.nodemailerService.sendEmailWithConfirmationCode({
                email: newUser.accountData.email,
                confirmationCode: newUser.emailConfirmation.confirmationCode!,
                currentURL,
            }).catch((err: any) => {
                console.log(`Sending registration email error: ${err}`)
            })
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: createdUserId,
        };
    }

    async deleteUserById(id: string): Promise<boolean> {
        return this.usersRepository.deleteUserById(id);
    }
}

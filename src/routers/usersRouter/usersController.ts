import { Response } from "express";
import { inject, injectable } from "inversify";

import {
    CreateUserReqType,
    CreateUserResType,
    DeleteUserByIdReqType,
    GetAllUsersReqType,
    GetAllUsersResType
} from "./types";
import { parseUsersQueryParams } from "../../utils";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { UsersService } from "../../services/usersService/usersService";
import { UsersQueryRepository } from "../../repositories/usersRepositories";

@injectable()
export class UsersController {
    constructor(@inject(UsersService) private usersService: UsersService,
                @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository) {
    }

    async getUsers(req: GetAllUsersReqType, res: GetAllUsersResType){
        const parsedQuery = parseUsersQueryParams(req.query)
        const allUsers = await this.usersQueryRepository.getAllUsers(parsedQuery);

        res
            .status(200)
            .json(allUsers);
    }

    async createUser(req: CreateUserReqType, res: CreateUserResType) {
        const result = await this.usersService.addNewUser({
            login: req.body.login.trim(),
            password: req.body.password,
            email: req.body.email.trim(),
        });

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .json({
                    errorsMessages: result.extensions
                })
            return;
        }

        const createdUser = await this.usersQueryRepository.getUserById(result.data!);
        if (!createdUser) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdUser);
    }

    async deleteUserById(req: DeleteUserByIdReqType, res: Response) {
        const isDeleted = await this.usersService.deleteUserById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    }
}

import { Response, Router } from "express";


import {
    CreateUserReqType,
    CreateUserResType,
    DeleteUserByIdReqType,
    GetAllUsersReqType,
    GetAllUsersResType
} from "./types";
import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from "./validators";
import { parseUsersQueryParams } from "../../utils";
import { usersService } from "../../services/usersService/usersService";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { usersQueryRepository } from "../../repositories/usersRepositories";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const usersRouter = Router();

const usersController = {
    getUsers: async (req: GetAllUsersReqType, res: GetAllUsersResType) => {
        const parsedQuery = parseUsersQueryParams(req.query)
        const allUsers = await usersQueryRepository.getAllUsers(parsedQuery);

        res
            .status(200)
            .json(allUsers);
    },
    createUser: async (req: CreateUserReqType, res: CreateUserResType) => {
        const errorsMessages: { field: keyof UserViewType, message: string }[] = [];
        const createdUserId = await usersService.addNewUser({
            login: req.body.login.trim(),
            password: req.body.password,
            email: req.body.email.trim(),
            errorsMessages,
        });

        if (errorsMessages.length) {
            res
                .status(400)
                .json({errorsMessages});

            return;
        }

        if (!createdUserId) {
            res.sendStatus(599);
            return;
        }

        const createdUser = await usersQueryRepository.getUserById(createdUserId);
        if (!createdUser) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdUser);
    },
    deleteUserById: async (req: DeleteUserByIdReqType, res: Response) => {
        const isDeleted = await usersService.deleteUserById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
}

usersRouter
    .route("/")
    .get(
        basicAuthMiddleware,
        // @ts-ignore
        usersController.getUsers)
    .post(
        basicAuthMiddleware,
        userLoginValidator,
        userPasswordValidator,
        userEmailValidator,
        errorResultMiddleware,
        usersController.createUser);

usersRouter
    .route("/:id")
    .delete(
    basicAuthMiddleware,
    usersController.deleteUserById);
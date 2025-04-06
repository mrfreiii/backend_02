import { Router } from "express";

import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from "../validators";
import { ioc } from "../../composition-root";
import { UsersController } from "./usersController";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const usersRouter = Router();
const usersController = ioc.get(UsersController)

usersRouter
    .route("/")
    .get(
        basicAuthMiddleware,
        // @ts-ignore
        usersController.getUsers.bind(usersController))
    .post(
        basicAuthMiddleware,
        userLoginValidator,
        userPasswordValidator,
        userEmailValidator,
        errorResultMiddleware,
        usersController.createUser.bind(usersController));

usersRouter
    .route("/:id")
    .delete(
        basicAuthMiddleware,
        usersController.deleteUserById.bind(usersController));
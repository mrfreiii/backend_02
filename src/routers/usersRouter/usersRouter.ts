import { Router } from "express";

import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from "../validators";
import { UsersController } from "./usersController";
import { compositionRootContainer } from "../../composition-root";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const usersRouter = Router();
const usersController = compositionRootContainer.get(UsersController)

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
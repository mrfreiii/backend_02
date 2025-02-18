import { Response, Request, Router } from "express";

import { HttpStatuses } from "../types";
import { LoginUserReqType } from "./types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { jwtService } from "../../services/jwtService/jwtService";
import { authService } from "../../services/authService/authService";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { loginOrEmailValidator, passwordValidator } from "./validators";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const authRouter = Router();

const authController = {
    loginUser: async (req: LoginUserReqType, res: Response) => {
        const {loginOrEmail, password} = req.body;
        const result = await authService.checkCredentials({loginOrEmail, password});

        if(result.status !== ResultStatus.Success){
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const token = await jwtService.createJWT(result.data!);
        res
            .status(HttpStatuses.Success_200)
            .json({
                accessToken: token
            })
    },
    getUserInfo: async (req: Request, res: Response) => {
        const user = req.user;
        if(!user){
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json({
                email: user.email,
                login: user.login,
                userId: user.id,
            })
    },
}

authRouter
    .route("/login")
    .post(
    loginOrEmailValidator,
    passwordValidator,
    errorResultMiddleware,
    authController.loginUser);

authRouter
    .route("/me")
    .get(
    jwtAuthMiddleware,
    authController.getUserInfo);
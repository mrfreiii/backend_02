import { Response, Request, Router } from "express";

import { LoginUserReqType } from "./types";
import { jwtService } from "../../services/jwtService/jwtService";
import { authService } from "../../services/authService/authService";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { loginOrEmailValidator, passwordValidator } from "./validators";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const authRouter = Router();

const authController = {
    getJwtToken: async (req: LoginUserReqType, res: Response) => {
        const {loginOrEmail, password} = req.body;
        const user = await authService.checkCredentials({loginOrEmail, password});

        if(!user){
            res.sendStatus(401)
            return;
        }

        const token = await jwtService.createJWT(user);
        res
            .status(200)
            .json({
                accessToken: token
            })
    },
    getUserInfo: async (req: Request, res: Response) => {
        const user = req.user;
        if(!user){
            res.sendStatus(401)
            return;
        }

        res
            .status(200)
            .json({
                email: user.email,
                login: user.login,
                userId: user.id,
            })
    },
}

authRouter.post("/login",
    loginOrEmailValidator,
    passwordValidator,
    errorResultMiddleware,
    authController.getJwtToken);

authRouter.get("/me",
    jwtAuthMiddleware,
    authController.getUserInfo);
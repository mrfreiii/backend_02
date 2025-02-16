import { Response, Router } from "express";

import { LoginUserReqType } from "./types";
import { authService } from "../../services/authService/authService";
import { loginOrEmailValidator, passwordValidator } from "./validators";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const authRouter = Router();

const authController = {
    loginUser: async (req: LoginUserReqType, res: Response) => {
        const {loginOrEmail, password} = req.body;
        const isCredentialValid = await authService.loginUser({loginOrEmail, password});

        if(!isCredentialValid){
            res.sendStatus(401)
            return;
        }

        res.sendStatus(204)
    },
}

authRouter.post("/login",
    loginOrEmailValidator,
    passwordValidator,
    errorResultMiddleware,
    authController.loginUser);

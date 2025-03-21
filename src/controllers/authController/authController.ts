import { Response, Request, Router } from "express";

import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from "../validators";
import {
    ConfirmRegistrationReqType,
    LoginUserReqType,
    LogoutUserReqType,
    RefreshTokenReqType,
    RegisterUserReqType,
    ResendRegistrationEmailReqType
} from "./types";
import {
    confirmationCodeValidator,
    loginOrEmailValidator,
    passwordValidator
} from "./validators";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { jwtService } from "../../services/jwtService/jwtService";
import { authService } from "../../services/authService/authService";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { usersService } from "../../services/usersService/usersService";
import { rateLimitMiddleware } from "../../middlewares/rateLimitMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const authRouter = Router();

const authController = {
    loginUser: async (req: LoginUserReqType, res: Response) => {
        const {loginOrEmail, password} = req.body;
        const result = await authService.checkCredentials({loginOrEmail, password});

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const userId = result.data!._id.toString();
        const userAgent = req.headers["user-agent"];
        const ip = req.ip;

        const tokensResult = await jwtService.createJWT({userId, userAgent, ip});
        if (tokensResult.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const {accessToken, refreshToken} = tokensResult.data!;

        res
            .status(HttpStatuses.Success_200)
            .cookie("refreshToken", refreshToken, {httpOnly: true, secure: true})
            .json({
                accessToken,
            })
    },
    refreshToken: async (req: RefreshTokenReqType, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const userAgent = req.headers["user-agent"];
        const ip = req.ip;

        const tokensResult = await jwtService.updateJWT({refreshToken, userAgent, ip});

        if (tokensResult.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(tokensResult.status))
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .cookie("refreshToken", tokensResult.data!.refreshToken, {
                httpOnly: true,
                secure: true
            })
            .json({
                accessToken: tokensResult.data!.accessToken,
            })
    },
    logoutUser: async (req: LogoutUserReqType, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await jwtService.revokeRefreshToken(refreshToken);

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    },
    getUserInfo: async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) {
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
    registerUser: async (req: RegisterUserReqType, res: Response) => {
        const result = await usersService.addNewUser({
            login: req.body.login.trim(),
            password: req.body.password,
            email: req.body.email.trim(),
            needEmailConfirmation: true,
            confirmationURL: `${req.protocol + "://" + req.get("host")}`
        });

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .json({
                    errorsMessages: result.extensions
                })
            return;
        }

        res.sendStatus(204)
    },
    confirmRegistration: async (req: ConfirmRegistrationReqType, res: Response) => {
        const result = await authService.confirmRegistration(req.body.code);

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .json({
                    errorsMessages: result.extensions
                })
            return;
        }

        res.sendStatus(204)
    },
    resendRegistrationEmail: async (req: ResendRegistrationEmailReqType, res: Response) => {
        const result = await authService.resendRegistrationEmail({
            email: req.body.email,
            confirmationURL: `${req.protocol + "://" + req.get("host")}`
        });

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .json({
                    errorsMessages: result.extensions
                })
            return;
        }

        res.sendStatus(204)
    },
}

authRouter
    .route("/login")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        loginOrEmailValidator,
        passwordValidator,
        errorResultMiddleware,
        authController.loginUser);

authRouter
    .route("/refresh-token")
    .post(
        authController.refreshToken);

authRouter
    .route("/logout")
    .post(
        authController.logoutUser);

authRouter
    .route("/me")
    .get(
        jwtAuthMiddleware,
        authController.getUserInfo);

authRouter
    .route("/registration")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        userLoginValidator,
        userPasswordValidator,
        userEmailValidator,
        errorResultMiddleware,
        authController.registerUser);

authRouter
    .route("/registration-confirmation")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        confirmationCodeValidator,
        errorResultMiddleware,
        authController.confirmRegistration);

authRouter
    .route("/registration-email-resending")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        userEmailValidator,
        errorResultMiddleware,
        authController.resendRegistrationEmail);
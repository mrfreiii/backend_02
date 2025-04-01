import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import {
    ConfirmRegistrationReqType,
    LoginUserReqType,
    LogoutUserReqType,
    RecoverPasswordReqType,
    RefreshTokenReqType,
    RegisterUserReqType,
    ResendRegistrationEmailReqType
} from "./types";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { JwtService } from "../../services/jwtService/jwtService";
import { AuthService } from "../../services/authService/authService";
import { UsersService } from "../../services/usersService/usersService";

@injectable()
export class AuthController {
    constructor(@inject(AuthService) private authService: AuthService,
                @inject(UsersService) private usersService: UsersService,
                @inject(JwtService) private jwtService: JwtService) {}

    async loginUser(req: LoginUserReqType, res: Response) {
        const {loginOrEmail, password} = req.body;
        const result = await this.authService.checkCredentials({loginOrEmail, password});

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const userId = result.data!._id.toString();
        const userAgent = req.headers["user-agent"];
        const ip = req.ip;

        const tokensResult = await this.jwtService.createJWT({userId, userAgent, ip});
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
    }

    async refreshToken(req: RefreshTokenReqType, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const userAgent = req.headers["user-agent"];
        const ip = req.ip;

        const tokensResult = await this.jwtService.updateJWT({refreshToken, userAgent, ip});

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
    }

    async logoutUser(req: LogoutUserReqType, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await this.jwtService.revokeRefreshToken(refreshToken);

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    }

    async getUserInfo(req: Request, res: Response) {
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
    }

    async registerUser(req: RegisterUserReqType, res: Response) {
        const result = await this.usersService.addNewUser({
            login: req.body.login.trim(),
            password: req.body.password,
            email: req.body.email.trim(),
            needEmailConfirmation: true,
            currentURL: `${req.protocol + "://" + req.get("host")}`
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
    }

    async confirmRegistration (req: ConfirmRegistrationReqType, res: Response) {
        const result = await this.authService.confirmRegistration(req.body.code);

        if (result.status !== ResultStatus.Success) {
            res
                .status(resultCodeToHttpException(result.status))
                .json({
                    errorsMessages: result.extensions
                })
            return;
        }

        res.sendStatus(204)
    }

    async resendRegistrationEmail (req: ResendRegistrationEmailReqType, res: Response) {
        const result = await this.authService.resendRegistrationEmail({
            email: req.body.email,
            currentURL: `${req.protocol + "://" + req.get("host")}`
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
    }

    async recoverPassword (req: RecoverPasswordReqType, res: Response) {
        await this.authService.recoverPassword({
            email: req.body.email.trim(),
            currentURL: `${req.protocol + "://" + req.get("host")}`
        })

        res.sendStatus(204)
    }
}

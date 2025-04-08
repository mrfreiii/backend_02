import { NextFunction, Request, Response } from "express";

import { ioc } from "../composition-root";
import { JwtService } from "../services/jwtService/jwtService";
import { UsersQueryRepository } from "../repositories/usersRepositories";

export const AUTH_ERROR_MESSAGES = {
    NoHeader: "there is no authorization header",
    InvalidHeader: "authorization type must be BEARER or invalid header",
    InvalidJwtToken: "invalid jwt token",
    UserNotFound: "user not found",
}

export const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.NoHeader});

        return;
    }

    const authData = authHeader?.split(" ");
    if (authData?.[0] !== "Bearer" || authData?.length !== 2) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.InvalidHeader});

        return;
    }

    const jwtToken = authData[1];
    const { userId } = ioc.get(JwtService).verifyRefreshTokenAndParseIt(jwtToken) || {};
    if (!userId) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.InvalidJwtToken});

        return;
    }

    const usersQueryRepository = new UsersQueryRepository();
    const user = await usersQueryRepository.getUserById(userId);
    if (!user) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.UserNotFound});

        return;
    }

    req.user = user;
    next();
}
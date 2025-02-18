import { NextFunction, Request, Response } from "express";

import { SETTINGS } from "../settings";

export const AUTH_ERROR_MESSAGES = {
    NoHeader: "there is no authorization header",
    InvalidHeader: "authorization type must be BASIC or invalid header",
    InvalidLoginOrPassword: "invalid login or password",
}

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.NoHeader});

        return;
    }

    const authData = authHeader?.split(" ");
    if (authData?.[0] !== "Basic" || authData?.length !== 2) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.InvalidHeader});

        return;
    }

    const userCredentials = Buffer.from(authData?.[1] as string, "base64").toString("utf8");
    const [login, password] = userCredentials.split(":");

    if (login !== SETTINGS.CREDENTIALS.LOGIN || password !== SETTINGS.CREDENTIALS.PASSWORD) {
        res
            .status(401)
            .json({error: AUTH_ERROR_MESSAGES.InvalidLoginOrPassword});

        return;
    }

    next();
}
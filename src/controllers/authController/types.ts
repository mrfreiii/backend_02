import { Request } from "express";

export type LoginUserReqType = Request<{}, {}, { loginOrEmail: string; password: string }>

export interface RefreshTokenReqType extends Request {
    cookies: { refreshToken: string; };
}

export interface LogoutUserReqType extends Request {
    cookies: { refreshToken: string; };
}

export type RegisterUserReqType = Request<{}, {}, { login: string; password: string; email: string }>;

export type ConfirmRegistrationReqType = Request<{}, {}, { code: string; }>;

export type ResendRegistrationEmailReqType = Request<{}, {}, { email: string; }>;


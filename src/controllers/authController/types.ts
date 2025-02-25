import { Request } from "express";

export type LoginUserReqType = Request<{}, {}, { loginOrEmail: string; password: string }>;

export type RegisterUserReqType = Request<{}, {}, { login: string; password: string; email: string }>;

export type ConfirmRegistrationReqType = Request<{}, {}, { code: string; }>;

export type ResendRegistrationEmailReqType = Request<{}, {}, { email: string; }>;


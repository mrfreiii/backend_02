import { Request } from "express";

export type LoginUserReqType = Request<{}, {}, { loginOrEmail: string; password: string }>;

export type RegisterUserReqType = Request<{}, {}, { login: string; password: string; email: string }>;


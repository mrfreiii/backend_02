import { Request } from "express";

export type LoginUserReqType = Request<{}, {}, { loginOrEmail: string; password: string }>;


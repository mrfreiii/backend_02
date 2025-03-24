import { Request, Response } from "express";
import { SessionViewType } from "../../repositories/sessionsRepositories/types";

export interface getActiveSessionsReqType extends Request {
    cookies: { refreshToken: string; };
}
export type getActiveSessionsResType = Response<SessionViewType[]>;

export interface DeleteAllOtherDevicesReqType extends Request {
    cookies: { refreshToken: string; };
}

export interface DeleteDeviceByIdReqType extends Request<{ deviceId: string }> {
    cookies: { refreshToken: string; };
}

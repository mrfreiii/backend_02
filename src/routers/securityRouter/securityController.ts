import { Response, Router } from "express";

import {
    DeleteAllOtherDevicesReqType,
    DeleteDeviceByIdReqType,
    getActiveSessionsReqType,
    getActiveSessionsResType
} from "./types";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { jwtService } from "../../services/jwtService/jwtService";
import { sessionQueryRepository } from "../../repositories/sessionsRepositories";
import { sessionsService } from "../../services/sessionsService/sessionsService";

export const securityRouter = Router();

const securityController = {
    getActiveSessions: async (req: getActiveSessionsReqType, res: getActiveSessionsResType) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const {userId} = jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const sessions = await sessionQueryRepository.getAllSessions(userId);
        res
            .status(HttpStatuses.Success_200)
            .json(sessions)
    },
    deleteAllOtherDevices: async (req: DeleteAllOtherDevicesReqType, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await sessionsService.deleteAllDevices(refreshToken);
        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(204);
    },
    deleteDeviceById: async (req: DeleteDeviceByIdReqType, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await sessionsService.deleteDeviceById({
            deviceId: req.params.deviceId,
            refreshToken
        });
        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(204);
    },
}

securityRouter
    .route("/devices")
    .get(securityController.getActiveSessions)
    .delete(securityController.deleteAllOtherDevices);


securityRouter
    .route("/devices/:deviceId")
    .delete(
        securityController.deleteDeviceById);


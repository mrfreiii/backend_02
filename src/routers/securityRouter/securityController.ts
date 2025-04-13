import { Response } from "express";
import { inject, injectable } from "inversify";

import {
    DeleteAllOtherDevicesReqType,
    DeleteDeviceByIdReqType,
    getActiveSessionsReqType,
    getActiveSessionsResType
} from "./types";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { JwtService } from "../../services/jwtService/jwtService";
import { SessionQueryRepository } from "../../repositories/sessionsRepositories";
import { SessionsService } from "../../services/sessionsService/sessionsService";


@injectable()
export class SecurityController{
    constructor(@inject(SessionQueryRepository) private sessionQueryRepository: SessionQueryRepository,
                @inject(JwtService) private jwtService: JwtService,
                @inject(SessionsService) private sessionsService: SessionsService) {}

    async getActiveSessions(req: getActiveSessionsReqType, res: getActiveSessionsResType) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const {userId} = this.jwtService.verifyTokenAndParseIt(refreshToken) || {};
        if (!userId) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const sessions = await this.sessionQueryRepository.getAllSessions(userId);
        res
            .status(HttpStatuses.Success_200)
            .json(sessions)
    }

    async deleteAllOtherDevices(req: DeleteAllOtherDevicesReqType, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await this.sessionsService.deleteAllDevices(refreshToken);
        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(204);
    }

    async deleteDeviceById(req: DeleteDeviceByIdReqType, res: Response) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.sendStatus(HttpStatuses.Unauthorized_401)
            return;
        }

        const result = await this.sessionsService.deleteDeviceById({
            deviceId: req.params.deviceId,
            refreshToken
        });
        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(204);
    }
}

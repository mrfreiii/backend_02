import { Router } from "express";

import { HttpStatuses } from "../types";
import { jwtService } from "../../services/jwtService/jwtService";
import { getActiveSessionsReqType, getActiveSessionsResType } from "./types";
import { sessionQueryRepository } from "../../repositories/sessionsRepositories";

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
}

securityRouter
    .route("/devices")
    .get(
        securityController.getActiveSessions);


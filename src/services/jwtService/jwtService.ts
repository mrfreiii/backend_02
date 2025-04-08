import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";

import { SETTINGS } from "../../settings";
import { RefreshJwtPayloadType } from "./types";
import { ResultStatus, ResultType } from "../types";
import { getDatesFromToken } from "../../utils/jwtTokens";
import { SessionsRepository } from "../../repositories/sessionsRepositories";
import { SessionDbType } from "../../repositories/sessionsRepositories/types";
import { createAccessToken, createRefreshToken, getDeviceTitle } from "./helpers";

@injectable()
export class JwtService{
    constructor(@inject(SessionsRepository) private sessionsRepository: SessionsRepository) {}

    async createJWT(
        {
            userId,
            userAgent,
            ip,
        }: {
            userId: string;
            userAgent: string | undefined;
            ip: string | undefined;
        }): Promise<ResultType<{
        accessToken: string;
        refreshToken: string
    } | null>> {
        const deviceId = uuidv4();

        const accessToken = createAccessToken(userId);
        const refreshToken = createRefreshToken({userId, deviceId});

        const deviceTitle = getDeviceTitle(userAgent);
        const {issuedAt, expirationTime} = getDatesFromToken(refreshToken);

        const deviceData: SessionDbType = {
            userId,
            deviceId,
            ip: ip || "unknown ip",
            title: deviceTitle,
            issuedAt,
            expirationTime,
        }

        const sessionId = this.sessionsRepository.addNewSession(deviceData);
        if (!sessionId) {
            return {
                status: ResultStatus.ServerError,
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: {
                accessToken,
                refreshToken,
            }
        }
    }

    async updateJWT(
        {
            refreshToken,
            userAgent,
            ip,
        }: {
            refreshToken: string;
            userAgent: string | undefined;
            ip: string | undefined;
        }): Promise<ResultType<{
        accessToken: string;
        refreshToken: string
    } | null>> {
        const {
            userId,
            deviceId
        } = this.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId || !deviceId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const {issuedAt} = getDatesFromToken(refreshToken);

        const currentSession = await this.sessionsRepository.getSession({
            userId,
            deviceId,
            issuedAt
        })
        if (!currentSession) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const newAccessToken = createAccessToken(userId);
        const newRefreshToken = await createRefreshToken({userId, deviceId});

        const deviceTitle = getDeviceTitle(userAgent);
        const {
            issuedAt: newIssuedAt,
            expirationTime: newExpirationTime
        } = getDatesFromToken(newRefreshToken);

        const updatedDeviceData: SessionDbType = {
            userId,
            deviceId,
            ip: ip || "unknown",
            title: deviceTitle,
            issuedAt: newIssuedAt,
            expirationTime: newExpirationTime,
        }

        const isSessionUpdated = await this.sessionsRepository.updateSession({
            _id: currentSession._id,
            updatedSession: updatedDeviceData
        })
        if (!isSessionUpdated) {
            return {
                status: ResultStatus.ServerError,
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            }
        }
    }

    async revokeRefreshToken(refreshToken: string): Promise<ResultType> {
        const {userId, deviceId} = this.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId || !deviceId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const {issuedAt} = getDatesFromToken(refreshToken);
        const isCurrentSessionValid = await this.sessionsRepository.getSession({
            userId,
            deviceId,
            issuedAt,
        })
        if (!isCurrentSessionValid) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const isSessionDeleted = await this.sessionsRepository.deleteSession({
            userId,
            deviceId,
        })
        if (!isSessionDeleted) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        };
    }

    verifyRefreshTokenAndParseIt(token: string): RefreshJwtPayloadType | null {
        try {
            return jwt.verify(token, SETTINGS.JWT_SECRET) as RefreshJwtPayloadType;
        } catch {
            return null;
        }
    }
}
import { ResultStatus, ResultType } from "../types";
import { jwtService } from "../jwtService/jwtService";
import { getDatesFromToken } from "../../utils/jwtTokens";
import { sessionsRepository } from "../../repositories/sessionsRepositories";

export const sessionsService = {
    deleteAllDevices: async (refreshToken: string): Promise<ResultType> => {
        const { userId, deviceId} = jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId || !deviceId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        await sessionsRepository.deleteAllOtherSessions({
            userId,
            currentDeviceId: deviceId
        })

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        }
    },
    deleteDeviceById: async (
        {
            deviceId,
            refreshToken,
        }:{
            deviceId: string;
            refreshToken: string;
        }): Promise<ResultType> => {
        const { userId, deviceId: deviceIdFromToken} = jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const {issuedAt} = getDatesFromToken(refreshToken);
        const isCurrentSessionValid = await sessionsRepository.getSession({
            userId,
            deviceId: deviceIdFromToken,
            issuedAt,
        })
        if (!isCurrentSessionValid) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const deviceForDeletionInfo = await sessionsRepository.getSession({deviceId});
        if (!deviceForDeletionInfo) {
            return {
                status: ResultStatus.NotFound,
                extensions: [],
                data: null,
            }
        }

        if(userId !== deviceForDeletionInfo.userId){
            return {
                status: ResultStatus.Forbidden,
                extensions: [],
                data: null,
            }
        }

        const isSessionDeleted = await sessionsRepository.deleteSession({
            userId,
            deviceId,
        })
        if (!isSessionDeleted) {
            return {
                status: ResultStatus.ServerError,
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        }
    },
}
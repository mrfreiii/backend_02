import { ResultStatus, ResultType } from "../types";
import { jwtService } from "../jwtService/jwtService";
import { sessionsRepository } from "../../repositories/sessionsRepositories";

export const sessionsService = {
    deleteDeviceById: async (
        {
            deviceId,
            refreshToken,
        }:{
            deviceId: string;
            refreshToken: string;
        }): Promise<ResultType> => {
        const { userId} = jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const deviceInfo = await sessionsRepository.getSession({deviceId});
        if (!deviceInfo) {
            return {
                status: ResultStatus.NotFound,
                extensions: [],
                data: null,
            }
        }

        if(userId !== deviceInfo.userId){
            return {
                status: ResultStatus.Forbidden,
                extensions: [],
                data: null,
            }
        }

        const isSessionDeleted = await sessionsRepository.deleteSession({
            userId,
            deviceId
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
import { inject, injectable } from "inversify";

import { ResultStatus, ResultType } from "../types";
import { JwtService } from "../jwtService/jwtService";
import { getDatesFromToken } from "../../utils/jwtTokens";
import { SessionsRepository } from "../../repositories/sessionsRepositories";

@injectable()
export class SessionsService {
    constructor(@inject(SessionsRepository) private sessionsRepository: SessionsRepository,
                @inject(JwtService) private jwtService: JwtService) {}

    async deleteAllDevices(refreshToken: string): Promise<ResultType> {
        const { userId, deviceId} = this.jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId || !deviceId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        await this.sessionsRepository.deleteAllOtherSessions({
            userId,
            currentDeviceId: deviceId
        })

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        }
    }

    async deleteDeviceById(
        {
            deviceId,
            refreshToken,
        }:{
            deviceId: string;
            refreshToken: string;
        }): Promise<ResultType> {
        const { userId, deviceId: deviceIdFromToken} = this.jwtService.verifyRefreshTokenAndParseIt(refreshToken) || {};
        if (!userId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const {issuedAt} = getDatesFromToken(refreshToken);
        const isCurrentSessionValid = await this.sessionsRepository.getSession({
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

        const deviceForDeletionInfo = await this.sessionsRepository.getSession({deviceId});
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

        const isSessionDeleted = await this.sessionsRepository.deleteSession({
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
    }
}
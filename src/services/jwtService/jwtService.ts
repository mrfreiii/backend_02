import jwt from "jsonwebtoken";

import { JwtPayloadType } from "./types";
import { SETTINGS } from "../../settings";
import { ResultStatus, ResultType } from "../types";
import { usersRepository } from "../../repositories/usersRepositories";

export const jwtService = {
    createJWT: async (userId: string): Promise<ResultType<{
        accessToken: string;
        refreshToken: string
    }>> => {
        const payload: JwtPayloadType = {
            userId,
        }

        const accessToken = jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "10s"});
        const refreshToken = jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "20s"});

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: {
                accessToken,
                refreshToken,
            }
        }
    },
    updateJWT: async (refreshToken: string): Promise<ResultType<{
        accessToken: string;
        refreshToken: string
    } | null>> => {
        const userId = jwtService.getUserIdByJwtToken(refreshToken);
        if (!userId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const user = await usersRepository.getUserById(userId);
        if (!user) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const isRefreshTokenInBlackList = user.tokens?.refreshTokenBlackList?.includes(refreshToken);
        if(isRefreshTokenInBlackList){
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const newTokensResult = await jwtService.createJWT(userId);

        const currentBlackList = user.tokens?.refreshTokenBlackList || [];
        const updatedBlackList = [...currentBlackList, refreshToken];

        const isBlackListUpdated = await usersRepository.updateRefreshTokensBlackList({userId, updatedBlackList})
        if(!isBlackListUpdated){
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        return newTokensResult;
    },
    revokeRefreshToken: async (refreshToken: string): Promise<ResultType> => {
        const userId = jwtService.getUserIdByJwtToken(refreshToken);
        if (!userId) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const user = await usersRepository.getUserById(userId);
        if (!user) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const isRefreshTokenInBlackList = user.tokens?.refreshTokenBlackList?.includes(refreshToken);
        if(isRefreshTokenInBlackList){
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        const currentBlackList = user.tokens?.refreshTokenBlackList || [];
        const updatedBlackList = [...currentBlackList, refreshToken];

        const isBlackListUpdated = await usersRepository.updateRefreshTokensBlackList({userId, updatedBlackList})
        if(!isBlackListUpdated){
            return {
                status: ResultStatus.Unauthorized,
                extensions: [],
                data: null,
            }
        }

        return  {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        };
    },
    getUserIdByJwtToken: (token: string): string | null => {
        try {
            const result = jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayloadType;
            return result?.userId;
        } catch {
            return null;
        }
    }
}
import jwt from "jsonwebtoken";
import { WithId } from "mongodb";

import { JwtPayloadType } from "./types";
import { SETTINGS } from "../../settings";
import { ResultStatus, ResultType } from "../types";
import { UserDbType } from "../../repositories/usersRepositories/types";

export const jwtService = {
    createJWT: async (user: WithId<UserDbType>): Promise<ResultType<{accessToken: string; refreshToken: string}>> => {
        const payload: JwtPayloadType = {
            userId: user._id.toString(),
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
    getUserIdByJwtToken: (token: string): string | null => {
        try {
            const result = jwt.verify(token, SETTINGS.JWT_SECRET) as JwtPayloadType;
            return result?.userId;
        } catch {
            return null;
        }
    }
}
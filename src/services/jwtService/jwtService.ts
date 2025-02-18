import jwt from "jsonwebtoken";
import { WithId } from "mongodb";

import { JwtPayloadType } from "./types";
import { SETTINGS } from "../../settings";
import { UserDbType } from "../../repositories/usersRepositories/types";

export const jwtService = {
    createJWT: async (user: WithId<UserDbType>): Promise<string> => {
        const payload: JwtPayloadType = {
            userId: user._id.toString(),
        }

        return jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "1h"});
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
import { WithId } from "mongodb";

import { sessionCollection } from "../../db/mongodb";
import { SessionDbType, SessionViewType } from "./types";

export const sessionQueryRepository = {
    getAllSessions: async (userId: string): Promise<SessionViewType[]> => {
        const allSessions = await sessionCollection
            .find({userId})
            .toArray();

        const onlyActiveSessions = allSessions.filter((session) => new Date(session.expirationTime) > new Date());

        return onlyActiveSessions.map((session)=> sessionQueryRepository._mapSessionDbTypeToSessionViewType(session));
    },
    _mapSessionDbTypeToSessionViewType: (session: WithId<SessionDbType>): SessionViewType => {
        const {ip, title, issuedAt, deviceId} = session;

        return {
            ip,
            title,
            lastActiveDate: issuedAt,
            deviceId,
        }
    }
}
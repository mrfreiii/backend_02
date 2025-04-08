import { WithId } from "mongodb";
import { injectable } from "inversify";

import { SessionDbType, SessionViewType } from "./types";
import { SessionModel } from "../../models/sessionsModel/session.entity";

@injectable()
export class SessionQueryRepository {
    async getAllSessions(userId: string): Promise<SessionViewType[]> {
        const allSessions = await SessionModel
            .find({userId})
            .lean();

        const onlyActiveSessions = allSessions.filter((session) => new Date(session.expirationTime) > new Date());

        return onlyActiveSessions.map((session)=> this._mapSessionDbTypeToSessionViewType(session));
    }

    _mapSessionDbTypeToSessionViewType(session: WithId<SessionDbType>): SessionViewType {
        const {ip, title, issuedAt, deviceId} = session;

        return {
            ip,
            title,
            lastActiveDate: issuedAt,
            deviceId,
        }
    }
}
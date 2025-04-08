import { injectable } from "inversify";
import { ObjectId, WithId } from "mongodb";

import { SessionDbType } from "./types";
import { SessionModel } from "../../models/sessionsModel/session.entity";

@injectable()
export class SessionsRepository {
    async clearDB() {
        return SessionModel.collection.drop();
    }

    async addNewSession(newSession: SessionDbType): Promise<string> {
        try {
            const createdSession = await SessionModel.create(newSession);
            return createdSession?._id?.toString();
        } catch {
            return ""
        }
    }

    async getSession(
        {
            deviceId,
            userId,
            issuedAt
        }: {
            deviceId?: string;
            userId?: string;
            issuedAt?: string;
        }): Promise<WithId<SessionDbType> | null> {
        const filter = {
            ...(deviceId && {deviceId}),
            ...(userId && {userId}),
            ...(issuedAt && {issuedAt}),
        }
        return SessionModel.findOne(filter);
    }

    async updateSession({_id, updatedSession}: {
        _id: ObjectId;
        updatedSession: SessionDbType
    }): Promise<boolean> {
        try {
            const result = await SessionModel.updateOne(
                {_id},
                {$set: updatedSession}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deleteSession(
        {
            deviceId,
            userId,
        }: {
            deviceId: string;
            userId: string;
        }): Promise<boolean> {
        try {
            const result = await SessionModel.deleteOne({deviceId, userId});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }

    async deleteAllOtherSessions(
        {
            currentDeviceId,
            userId
        }: {
            currentDeviceId: string;
            userId: string;
        }) {
        await SessionModel.deleteMany({
            deviceId: { $ne: currentDeviceId },
            userId
        });
    }
}

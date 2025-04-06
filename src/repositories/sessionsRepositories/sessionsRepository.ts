import { ObjectId, WithId } from "mongodb";
import { injectable } from "inversify";

import { SessionDbType } from "./types";
import { sessionCollection } from "../../db/mongodb";

@injectable()
export class SessionsRepository {
    async clearDB() {
        return sessionCollection.drop();
    }

    async addNewSession(newSession: SessionDbType): Promise<string> {
        try {
            const createdSession = await sessionCollection.insertOne(newSession);
            return createdSession?.insertedId?.toString();
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
        return sessionCollection.findOne(filter);
    }

    async updateSession({_id, updatedSession}: {
        _id: ObjectId;
        updatedSession: SessionDbType
    }): Promise<boolean> {
        try {
            const result = await sessionCollection.updateOne(
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
            const result = await sessionCollection.deleteOne({deviceId, userId});
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
        await sessionCollection.deleteMany({
            deviceId: { $ne: currentDeviceId },
            userId
        });
    }
}

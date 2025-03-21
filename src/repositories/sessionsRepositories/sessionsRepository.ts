import { ObjectId, WithId } from "mongodb";

import { SessionDbType } from "./types";
import { sessionCollection } from "../../db/mongodb";

export const sessionsRepository = {
    clearDB: async () => {
        return sessionCollection.drop();
    },
    addNewSession: async (newSession: SessionDbType): Promise<string> => {
        try {
            const createdSession = await sessionCollection.insertOne(newSession);
            return createdSession?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    checkSession: async (
        {
            deviceId,
            userId,
            issuedAt
        }: {
            deviceId: string;
            userId: string;
            issuedAt: string;
        }): Promise<WithId<SessionDbType> | null> => {
        return sessionCollection.findOne({deviceId, userId, issuedAt});
    },
    updateSession: async ({_id, updatedSession}: {
        _id: ObjectId;
        updatedSession: SessionDbType
    }): Promise<boolean> => {
        try {
            const result = await sessionCollection.updateOne(
                {_id},
                {$set: updatedSession}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    },
    deleteSession: async (
        {
            deviceId,
            userId
        }: {
            deviceId: string;
            userId: string;
        }): Promise<boolean> => {
        try {
            const result = await sessionCollection.deleteOne({deviceId, userId});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    },
}

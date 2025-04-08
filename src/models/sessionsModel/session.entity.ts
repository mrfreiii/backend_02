import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { SessionDbType } from "../../repositories/sessionsRepositories/types";

type SessionModel = Model<SessionDbType>;
// export type SessionDocument = HydratedDocument<SessionDbType>;

const sessionSchema = new mongoose.Schema<SessionDbType>({
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    issuedAt: { type: String, required: true },
    expirationTime: { type: String, required: true },
})
export const SessionModel = model<SessionDbType, SessionModel>(SETTINGS.PATH.SECURITY, sessionSchema)
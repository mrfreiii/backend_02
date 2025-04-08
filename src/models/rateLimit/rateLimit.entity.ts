import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { RateLimitDbType } from "../../repositories/rateLimitsRepositories/types";

type RateLimitModel = Model<RateLimitDbType>;
// export type RateLimitDocument = HydratedDocument<RateLimitDbType>;

const rateLimitSchema = new mongoose.Schema<RateLimitDbType>({
    url: { type: String, required: true },
    ip: { type: String, required: true },
    date: { type: Number, required: true },
})
export const RateLimitModel = model<RateLimitDbType, RateLimitModel>(SETTINGS.PATH.RATE_LIMIT, rateLimitSchema)
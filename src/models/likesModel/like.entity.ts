import mongoose, { model, Model } from "mongoose";
import { LikeDbType, LikeStatusEnum } from "../../repositories/likesRepositories/types";

type LikeModel = Model<LikeDbType>;
// export type LikeDocument = HydratedDocument<LikeDbType>;

const likeSchema = new mongoose.Schema<LikeDbType>({
    status: { type: String, enum: LikeStatusEnum, required: true },
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
    entityId: { type: String, required: true },
    addedAt: { type: Number, required: true },
})
export const LikeModel = model<LikeDbType, LikeModel>("likes", likeSchema)
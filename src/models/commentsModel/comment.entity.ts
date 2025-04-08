import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { CommentDbType } from "../../repositories/commentsRepositories/types";

type CommentModel = Model<CommentDbType>;
// export type CommentDocument = HydratedDocument<CommentDbType>;

const commentSchema = new mongoose.Schema<CommentDbType>({
    postId: { type: String, required: true },
    content: { type: String, required: true },
    commentatorInfo: {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true },
    },
    createdAt: { type: String, required: true },
})
export const CommentModel = model<CommentDbType, CommentModel>(SETTINGS.PATH.COMMENTS, commentSchema)
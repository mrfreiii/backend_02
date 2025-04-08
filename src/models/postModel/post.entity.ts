import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { PostDbType } from "../../repositories/postsRepositories/types";

type PostModel = Model<PostDbType>;
// export type PostDocument = HydratedDocument<PostDbType>;

const postSchema = new mongoose.Schema<PostDbType>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
})
export const PostModel = model<PostDbType, PostModel>(SETTINGS.PATH.POSTS, postSchema)
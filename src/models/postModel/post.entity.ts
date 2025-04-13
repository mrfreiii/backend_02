import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { NewestLikesType, PostDbType } from "../../repositories/postsRepositories/types";

type PostModel = Model<PostDbType>;
// export type PostDocument = HydratedDocument<PostDbType>;

const newestLikesSchema = new mongoose.Schema<NewestLikesType>({
    addedAt: { type: String, required: true },
    login: { type: String, required: true },
    userId: { type: String, required: true },
})

const postSchema = new mongoose.Schema<PostDbType>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
    extendedLikesInfo: {
        likesCount: { type: Number, required: true },
        dislikesCount: { type: Number, required: true },
        newestLikes: { type: [newestLikesSchema], required: true },
    }
})
export const PostModel = model<PostDbType, PostModel>(SETTINGS.PATH.POSTS, postSchema)
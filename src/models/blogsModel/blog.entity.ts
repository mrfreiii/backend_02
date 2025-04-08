import mongoose, { model, Model } from "mongoose";

import { SETTINGS } from "../../settings";
import { BlogDbType } from "../../repositories/blogsRepositories/types";

type BlogModel = Model<BlogDbType>;
// export type BlogDocument = HydratedDocument<BlogDbType>;

const blogSchema = new mongoose.Schema<BlogDbType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true },
})
export const BlogModel = model<BlogDbType, BlogModel>(SETTINGS.PATH.BLOGS, blogSchema)
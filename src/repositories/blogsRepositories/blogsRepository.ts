import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { BlogDbType, BlogViewType } from "./types";
import { BlogModel } from "../../models/blogsModel/blog.entity";

@injectable()
export class BlogsRepository {
    async clearDB() {
        return BlogModel.collection.drop();
    }

    async addNewBlog(newBlog: BlogDbType): Promise<string> {
        try {
            const createdBlog = await BlogModel.create(newBlog);
            return createdBlog?._id?.toString();
        } catch {
            return ""
        }
    }

    async updateBlog(dto: Omit<BlogViewType, "createdAt">): Promise<boolean> {
        const { id, ...updatedBlog } = dto;

        try {
            const result = await BlogModel.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedBlog}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deleteBlogById(id: string): Promise<boolean> {
        try {
            const result = await BlogModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }
}
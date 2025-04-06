import { ObjectId } from "mongodb";

import { blogCollection } from "../../db/mongodb";
import { BlogDbType, BlogViewType } from "./types";
import { injectable } from "inversify";

@injectable()
export class BlogsRepository {
    async clearDB() {
        return blogCollection.drop();
    }

    async addNewBlog(newBlog: BlogDbType): Promise<string> {
        try {
            const createdBlog = await blogCollection.insertOne(newBlog);
            return createdBlog?.insertedId?.toString();
        } catch {
            return ""
        }
    }

    async updateBlog(dto: Omit<BlogViewType, "createdAt">): Promise<boolean> {
        const { id, ...updatedBlog } = dto;

        try {
            const result = await blogCollection.updateOne(
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
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }
}
import { ObjectId } from "mongodb";

import { blogCollection } from "../../db/mongodb";
import { BlogDbType, BlogViewType } from "./types";

export const blogsRepository = {
    clearDB: async () => {
        return blogCollection.drop();
    },
    addNewBlog: async (newBlog: BlogDbType): Promise<string> => {
        try {
            const createdBlog = await blogCollection.insertOne(newBlog);
            return createdBlog?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    updateBlog: async (dto: Omit<BlogViewType, "createdAt">): Promise<boolean> => {
        const { id, ...updatedBlog } = dto;

        try {
            const result = await blogCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedBlog}
            );

            return result.matchedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        try {
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
}
import { ObjectId } from "mongodb";

import { BlogType } from "../db/types";
import { blogCollection } from "../db/mongodb";
import { replaceMongo_idByid } from "../utils/mapDbResult";

export const blogsRepositoryMongoDb = {
    clearDB: async () => {
        return blogCollection.drop();
    },
    getAllBlogs: async () => {
        const result = await blogCollection.find({}).toArray();
        return result?.map((blog) => replaceMongo_idByid(blog))
    },
    getBlogById: async (id: string): Promise<BlogType | undefined> => {
        try {
            const result = await blogCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return replaceMongo_idByid(result);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    addNewBlog: async (
        {
            name,
            description,
            websiteUrl
        }:
            {
                name: string;
                description: string;
                websiteUrl: string
            }): Promise<string> => {
        const newBlog: BlogType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
        };

        const createdBlog = await blogCollection.insertOne(newBlog);
        return createdBlog?.insertedId?.toString();
    },
    updateBlog: async (
        {
            id,
            name,
            description,
            websiteUrl
        }: {
            id: string;
            name: string;
            description: string;
            websiteUrl: string
        }): Promise<boolean> => {
        const updatedBlog: BlogType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
        }

        try {
            const result = await blogCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedBlog}
            );

            return result.matchedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        try{
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
}
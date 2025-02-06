import { ObjectId } from "mongodb";

import { PostType } from "../db/types";
import { postCollection } from "../db/mongodb";
import { replaceMongo_idByid } from "../utils/mapDbResult";
import { blogsRepositoryMongoDb } from "./blogsRepositoryMongoDb";

export const postsRepositoryMongoDb = {
    clearDB: async () => {
        return postCollection.drop();
    },
    getAllPosts: async () => {
        const result = await postCollection.find({}).toArray();
        return result?.map((post) => replaceMongo_idByid(post));
    },
    getPostById: async (id: string) => {
        try {
            const result = await postCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return replaceMongo_idByid(result);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    addNewPost: async (
        {
            title,
            shortDescription,
            content,
            blogId,
        }:
            {
                title: string;
                shortDescription: string;
                content: string;
                blogId: string;
            }
    ): Promise<string | undefined> => {
        const blog = await blogsRepositoryMongoDb.getBlogById(blogId);
        if (!blog) {
            return;
        }

        const newPost: PostType = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: (new Date()).toISOString(),
        };

        const createdPost = await postCollection.insertOne(newPost);
        return createdPost?.insertedId?.toString();
    },
    updatePost: async (
        {
            id,
            title,
            shortDescription,
            content,
            blogId,
        }:
            {
                id: string;
                title: string;
                shortDescription: string;
                content: string;
                blogId: string;
            }
    ): Promise<boolean> => {
        try {
            const foundBlog = await blogsRepositoryMongoDb.getBlogById(blogId);
            if (!foundBlog) {
                return false;
            }

            const updatedPost: PostType = {
                title: title.trim(),
                shortDescription: shortDescription.trim(),
                content: content.trim(),
                blogId: blogId,
                blogName: foundBlog.name,
            }

            const result = await postCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedPost}
            );

            return result.matchedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
    deletePostById: async (id: string): Promise<boolean> => {
        try{
            const result = await postCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
}
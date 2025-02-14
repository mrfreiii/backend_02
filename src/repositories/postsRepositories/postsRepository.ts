import { ObjectId } from "mongodb";

import { postCollection } from "../../db/mongodb";
import { PostDbType, PostViewType } from "./types";

export const postsRepository = {
    clearDB: async () => {
        return postCollection.drop();
    },
    addNewPost: async (
        newPost: PostDbType
    ): Promise<string> => {
        try {
            const createdPost = await postCollection.insertOne(newPost);
            return createdPost?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    updatePost: async (dto: Omit<PostViewType, "createdAt">): Promise<boolean> => {
        const {id, ...updatedPost} = dto;

        try {
            const result = await postCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedPost}
            );

            return result.matchedCount === 1;
        } catch (e) {
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
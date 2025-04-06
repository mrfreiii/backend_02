import { ObjectId } from "mongodb";

import { postCollection } from "../../db/mongodb";
import { PostDbType, PostViewType } from "./types";
import { injectable } from "inversify";

@injectable()
export class PostsRepository {
    async clearDB() {
        return postCollection.drop();
    }

    async addNewPost (
        newPost: PostDbType
    ): Promise<string> {
        try {
            const createdPost = await postCollection.insertOne(newPost);
            return createdPost?.insertedId?.toString();
        } catch {
            return ""
        }
    }

    async updatePost(dto: Omit<PostViewType, "createdAt">): Promise<boolean> {
        const {id, ...updatedPost} = dto;

        try {
            const result = await postCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedPost}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deletePostById(id: string): Promise<boolean> {
        try{
            const result = await postCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }
}
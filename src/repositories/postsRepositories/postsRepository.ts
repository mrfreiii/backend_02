import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { PostDbType } from "./types";
import { PostModel } from "../../models/postModel/post.entity";

@injectable()
export class PostsRepository {
    async clearDB() {
        return PostModel.collection.drop();
    }

    async addNewPost (
        newPost: PostDbType
    ): Promise<string> {
        try {
            const createdPost = await PostModel.create(newPost);
            return createdPost?._id?.toString();
        } catch {
            return ""
        }
    }

    async updatePost(dto: {postId: string; updatedPost: Partial<PostDbType>}): Promise<boolean> {
        const {postId, updatedPost} = dto;

        try {
            const result = await PostModel.updateOne(
                {_id: new ObjectId(postId)},
                {$set: updatedPost}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deletePostById(id: string): Promise<boolean> {
        try{
            const result = await PostModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }

    async getPostById(id: string): Promise<PostDbType | null> {
        try {
           return PostModel.findOne({_id: new ObjectId(id)});
        } catch {
            return null;
        }
    }
}
import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { PostDbType, PostViewType } from "./types";
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

    async updatePost(dto: Omit<PostViewType, "createdAt">): Promise<boolean> {
        const {id, ...updatedPost} = dto;

        try {
            const result = await PostModel.updateOne(
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
            const result = await PostModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }
}
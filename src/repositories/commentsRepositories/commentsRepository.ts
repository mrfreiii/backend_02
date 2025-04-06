import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { CommentDbType } from "./types";
import { commentCollection } from "../../db/mongodb";

@injectable()
export class CommentsRepository {
    async clearDB() {
        return commentCollection.drop();
    }

    async addNewComment(newComment: CommentDbType): Promise<string> {
        try {
            const createdComment = await commentCollection.insertOne(newComment);
            return createdComment?.insertedId?.toString();
        } catch {
            return ""
        }
    }

    async updateComment(dto: {id: string; content: string}): Promise<boolean> {
        const { id, content } = dto;

        try {
            const result = await commentCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: {content}}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deleteComment(id: string): Promise<boolean> {
        try {
            const result = await commentCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }
}
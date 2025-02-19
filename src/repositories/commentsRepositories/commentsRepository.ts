import { ObjectId } from "mongodb";

import { CommentDbType } from "./types";
import { commentCollection } from "../../db/mongodb";

export const commentsRepository = {
    clearDB: async () => {
        return commentCollection.drop();
    },
    addNewComment: async (newComment: CommentDbType): Promise<string> => {
        try {
            const createdComment = await commentCollection.insertOne(newComment);
            return createdComment?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    updateComment: async (dto: {id: string; content: string}): Promise<boolean> => {
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
    },
    deleteComment: async (id: string): Promise<boolean> => {
        try {
            const result = await commentCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    },
}
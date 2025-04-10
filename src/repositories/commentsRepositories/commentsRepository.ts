import { ObjectId } from "mongodb";
import { injectable } from "inversify";

import { CommentDbType } from "./types";
import { CommentModel } from "../../models/commentsModel/comment.entity";

@injectable()
export class CommentsRepository {
    async clearDB() {
        return CommentModel.collection.drop();
    }

    async addNewComment(newComment: CommentDbType): Promise<string> {
        try {
            const createdComment = await CommentModel.create(newComment);
            return createdComment?._id?.toString();
        } catch {
            return ""
        }
    }

    async updateComment(dto: { id: string; comment: Partial<CommentDbType> }): Promise<boolean> {
        const {id, comment} = dto;

        try {
            const result = await CommentModel.updateOne(
                {_id: new ObjectId(id)},
                {$set: comment}
            );

            return result.matchedCount === 1;
        } catch {
            return false;
        }
    }

    async deleteComment(id: string): Promise<boolean> {
        try {
            const result = await CommentModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    }

    async getCommentById(id: string): Promise<CommentDbType | null> {
        try{
            return CommentModel.findOne({_id: new ObjectId(id)});
        } catch {
            return null;
        }
    }
}
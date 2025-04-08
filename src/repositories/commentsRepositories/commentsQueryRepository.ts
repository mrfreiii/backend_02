import { injectable } from "inversify";
import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { CommentDbType, CommentViewType } from "./types";
import { CommentQueryType } from "../../routers/commentsRouter/types";
import { CommentModel } from "../../models/commentsModel/comment.entity";

@injectable()
export class CommentsQueryRepository {
    async getAllComments({parsedQuery, postId}: { parsedQuery: CommentQueryType, postId?: string }): Promise<WithPaginationType<CommentViewType>> {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (postId) {
            filter.postId = postId;
        }

        const allComments = await CommentModel
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
        const commentsCount = await this.getCommentsCount(filter);

        return {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: allComments?.map((comment) => this._mapCommentDbTypeToCommentViewType(comment))
        }
    }

    async getCommentsCount(filter: {postId?: string}): Promise<number> {
        return CommentModel.countDocuments(filter);
    }

    async getCommentById(id: string): Promise<CommentViewType | undefined> {
        try {
            const comment = await CommentModel.findOne({_id: new ObjectId(id)});
            if (!comment) {
                return;
            }

            return this._mapCommentDbTypeToCommentViewType(comment);
        } catch {
            return;
        }
    }

    _mapCommentDbTypeToCommentViewType(comment: WithId<CommentDbType>): CommentViewType {
        const {_id, content, commentatorInfo, createdAt} = comment;

        return {
            id: _id.toString(),
            content,
            commentatorInfo: {
                userId: commentatorInfo.userId,
                userLogin: commentatorInfo.userLogin,
            },
            createdAt
        }
    }
}
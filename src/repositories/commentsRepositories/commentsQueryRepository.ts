import { inject, injectable } from "inversify";
import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { CommentDbType, CommentViewType } from "./types";
import { LikeStatusEnum } from "../likesRepositories/types";
import { CommentQueryType } from "../../routers/commentsRouter/types";
import { LikesRepository } from "../likesRepositories";
import { CommentModel } from "../../models/commentsModel/comment.entity";

@injectable()
export class CommentsQueryRepository {
    constructor(@inject(LikesRepository) private likesRepository: LikesRepository) {
    }

    async getAllComments(
        {
            parsedQuery,
            postId,
            userId,
        }: {
            parsedQuery: CommentQueryType;
            postId?: string;
            userId: string | undefined;
        }): Promise<WithPaginationType<CommentViewType>> {
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

        const items: CommentViewType[] = []
        for (let i = 0; i < allComments.length; i++) {
            const item = await this._mapCommentDbTypeToCommentViewType({
                userId,
                comment: allComments[i]
            })
            items.push(item)
        }

        return {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items,
        }
    }

    async getCommentsCount(filter: { postId?: string }): Promise<number> {
        return CommentModel.countDocuments(filter);
    }

    async getCommentById({commentId, userId}: {
        commentId: string;
        userId: string | undefined;
    }): Promise<CommentViewType | undefined> {
        try {
            const comment = await CommentModel.findOne({_id: new ObjectId(commentId)});
            if (!comment) {
                return;
            }

            return this._mapCommentDbTypeToCommentViewType({userId, comment});
        } catch {
            return;
        }
    }

    async _mapCommentDbTypeToCommentViewType({userId, comment}: {
        userId: string | undefined;
        comment: WithId<CommentDbType>;
    }): Promise<CommentViewType> {
        const {
            _id,
            content,
            commentatorInfo,
            likesCount,
            dislikesCount,
            createdAt
        } = comment;

        let myStatus = LikeStatusEnum.None;
        if(userId){
            const userLike = await this.likesRepository.getLikeByUserIdAndEntityId({
                entityId: _id.toString(),
                userId,
            })
            myStatus = userLike?.status ?? myStatus;
        }


        return {
            id: _id.toString(),
            content,
            commentatorInfo: {
                userId: commentatorInfo.userId,
                userLogin: commentatorInfo.userLogin,
            },
            createdAt,
            likesInfo: {
                likesCount,
                dislikesCount,
                myStatus,
            }
        }
    }
}
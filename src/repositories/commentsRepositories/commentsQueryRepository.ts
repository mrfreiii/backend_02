import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { commentCollection } from "../../db/mongodb";
import { CommentDbType, CommentViewType } from "./types";
import { CommentQueryType } from "../../controllers/commentsController/types";

export const commentsQueryRepository = {
    getAllComments: async ({parsedQuery, postId}: { parsedQuery: CommentQueryType, postId?: string }): Promise<WithPaginationType<CommentViewType>> => {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (postId) {
            filter.postId = postId;
        }

        const allComments = await commentCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const commentsCount = await commentsQueryRepository.getCommentsCount(filter);

        return {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: allComments?.map((comment) => commentsQueryRepository._mapCommentDbTypeToCommentViewType(comment))
        }
    },
    getCommentsCount: async (filter: {postId?: string}): Promise<number> => {
        return commentCollection.countDocuments(filter);
    },
    getCommentById: async (id: string): Promise<CommentViewType | undefined> => {
        try {
            const comment = await commentCollection.findOne({_id: new ObjectId(id)});
            if (!comment) {
                return;
            }

            return commentsQueryRepository._mapCommentDbTypeToCommentViewType(comment);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _mapCommentDbTypeToCommentViewType: (comment: WithId<CommentDbType>): CommentViewType => {
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
import { Request, Response } from "express";

import { LikeStatusEnum } from "../../repositories/likesRepositories/types";
import { CommentViewType } from "../../repositories/commentsRepositories/types";

export type CommentQueryType = {
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
}

export type GetCommentByIdReqType = Request<{ id: string }, {}, {}, {}>;
export type GetCommentByIdResType = Response<CommentViewType>;

export type UpdateCommentReqType = Request<{ id: string }, {}, { content: string }>;

export type DeleteCommentReqType = Request<{ id: string }>;

export type UpdateLikeStatusReqType = Request<{ id: string }, {}, { likeStatus: LikeStatusEnum }>;
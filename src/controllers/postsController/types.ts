import { Request, Response } from "express";

import { WithPaginationType } from "../../types";
import { CommentQueryType } from "../commentsController/types";
import { PostViewType } from "../../repositories/postsRepositories/types";
import { CommentViewType } from "../../repositories/commentsRepositories/types";

export type PostQueryType = {
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
}

export type GetAllPostsReqType = Request<{}, {}, {}, PostQueryType>;
export type GetAllPostsResType = Response<WithPaginationType<PostViewType>>;

export type GetPostByIdReqType = Request<{id: string}>;
export type GetPostByIdResType = Response<PostViewType>;

export type CreatePostReqType = Request<{}, {}, Omit<PostViewType, "id" | "blogName" | "createdAt">>;
export type CreatePostResType = Response<PostViewType>;

export type UpdatePostReqType = Request<{id: string}, {}, Omit<PostViewType, "id" | "blogName" | "createdAt">>;

export type DeletePostByIdReqType = Request<{ id: string }>;

export type AddCommentByPostIdReqType = Request<{ postId: string }, {}, {content: string}>;
export type AddCommentByPostIdResType = Response<CommentViewType>;

export type GetCommentsByPostIdReqType = Request<{ postId: string }, {}, {}, CommentQueryType>;
export type GetCommentsByPostIdResType = Response<WithPaginationType<CommentViewType>>;

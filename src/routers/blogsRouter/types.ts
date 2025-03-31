import { Request, Response } from "express";

import { WithPaginationType } from "../../types";
import { PostQueryType } from "../postsRouter/types";
import { BlogViewType } from "../../repositories/blogsRepositories/types";
import { PostViewType } from "../../repositories/postsRepositories/types";

export type BlogQueryType = {
    searchNameTerm: string | null;
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
}

export type GetAllBlogsReqType = Request<{}, {}, {}, BlogQueryType>;
export type GetAllBlogsResType = Response<WithPaginationType<BlogViewType>>;

export type GetBlogByIdReqType = Request<{ id: string }, {}, {}, {}>;
export type GetBlogByIdResType = Response<BlogViewType>;

export type GetAllPostsByBlogIdReqType = Request<{ blogId: string }, {}, {}, PostQueryType>;
export type GetAllPostsByBlogIdResType = Response<WithPaginationType<PostViewType>>;

export type CreateBlogReqType = Request<{}, {}, Omit<BlogViewType, "id" | "createdAt">>;
export type CreateBlogResType = Response<BlogViewType>;

export type CreatePostByBlogIdReqType = Request<{ blogId: string }, {}, Omit<PostViewType, "id" | "blogName" | "blogId">, {}>;
export type CreatePostByBlogIdResType = Response<PostViewType>;

export type UpdateBlogReqType = Request<{id: string}, {}, Omit<BlogViewType, "id" | "createdAt">>;

export type DeleteBlogReqType = Request<{ id: string }>;


import { Request } from "express";
import { ObjectId } from "mongodb";

export type PostType = {
    id?: string; // deprecated
    _id?: ObjectId; // new from mongodb
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt?: string;
}

export type PostQueryType = {
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
}

export const PostsAvailableSortBy = ["id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt"]

export type GetAllPostsReqType = Request<{}, {}, {}, PostQueryType>;

export type CreatePostReqType = Request<{}, {}, Omit<PostType, "id" | "blogName">>;
export type UpdatePostReqType = Request<{id: string}, {}, Omit<PostType, "id" | "blogName">>;

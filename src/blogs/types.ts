import { Request } from "express";
import { ObjectId } from "mongodb";
import { QueryType } from "../types";

export type BlogType = {
    id?: string; // deprecated
    _id?: ObjectId; // new from mongodb
    name: string;
    description: string;
    websiteUrl: string;
    createdAt?: string;
    isMembership: boolean;
}

export type GetAllBlogsReqType = Request<{}, {}, {}, QueryType>;

export type CreateBlogReqType = Request<{}, {}, Omit<BlogType, "id">>;
export type UpdateBlogReqType = Request<{id: string}, {}, Omit<BlogType, "id">>;

export const BlogsAvailableSortBy = ["id", "createdAt", "name", "description", "websiteUrl", "isMembership"]

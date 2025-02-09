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

export type CreatePostReqType = Request<{}, {}, Omit<PostType, "id" | "blogName">>;
export type UpdatePostReqType = Request<{id: string}, {}, Omit<PostType, "id" | "blogName">>;

import { Request } from "express";
import { PostType } from "../db/types";

export type CreatePostReqType = Request<{}, {}, Omit<PostType, "id" | "blogName">>;
export type UpdatePostReqType = Request<{id: string}, {}, Omit<PostType, "id" | "blogName">>;

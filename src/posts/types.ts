import { Request } from "express";
import { PostType } from "../repositories/postsRepository";

export type CreatePostReqType = Request<{}, {}, Omit<PostType, "id" | "blogName">>;

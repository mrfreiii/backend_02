import { Request } from "express";
import { BlogType } from "../db/types";

export type CreateBlogReqType = Request<{}, {}, Omit<BlogType, "id">>;
export type UpdateBlogReqType = Request<{id: string}, {}, Omit<BlogType, "id">>;

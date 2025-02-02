import { Request } from "express";
import { BlogType } from "../repositories/blogsRepository";

export type CreateBlogReqType = Request<{}, {}, Omit<BlogType, "id">>;

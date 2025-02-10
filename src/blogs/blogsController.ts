import { Request, Router, Response } from "express";

import {
    BlogsAvailableSortBy,
    BlogType,
    CreateBlogReqType,
    CreatePostByBlogIdReqType,
    GetAllBlogsReqType,
    GetAllPostsByBlogIdReqType,
    UpdateBlogReqType
} from "./types";
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from "./blogsValidators";
import { WithPagination } from "../types";
import { blogsService } from "./blogsService";
import { parseBlogsQueryParams, parsePostsQueryParams } from "../utils/parseQueryParams";
import { errorResultMiddleware } from "../middlewares/errorResultMiddleware";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";
import { PostsAvailableSortBy, PostType } from "../posts/types";
import {
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "../posts/postsValidators";
import { postsService } from "../posts/postsService";

export const blogsRouter = Router();

const blogsController = {
    getBlogs: async (req: GetAllBlogsReqType, res: Response<WithPagination<BlogType>>) => {
        const parsedQuery = parseBlogsQueryParams({
            queryParams: req.query,
            availableFieldSortBy: BlogsAvailableSortBy
        })
        const allBlogs = await blogsService.getAllBlogs(parsedQuery);

        res
            .status(200)
            .json(allBlogs);
    },
    getBlogById: async (req: Request<{ id: string }>, res: Response<BlogType>) => {
        const foundBlog = await blogsService.getBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundBlog);
    },
    getPostsByBlogId: async (req: GetAllPostsByBlogIdReqType, res: Response<WithPagination<PostType>>) => {
        const parsedQuery = parsePostsQueryParams({
            queryParams: req.query,
            availableFieldSortBy: PostsAvailableSortBy
        })
        const allPosts = await blogsService.getPostsByBlogId({
            blogId: req.params.blogId,
            parsedQuery
        });

        if (!allPosts) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(allPosts);
    },
    createBlog: async (req: CreateBlogReqType, res: Response<BlogType>) => {
        const createdBlog = await blogsService.addNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership,
        });

        if (!createdBlog) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdBlog);
    },
    createPostByBlogId: async (req: CreatePostByBlogIdReqType, res: Response<PostType>) => {
        const createdPost = await postsService.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.params.blogId,
        });
        if (!createdPost) {
            res.sendStatus(404);
            return;
        }

        res
            .status(201)
            .json(createdPost);
    },
    updateBlog: async (req: UpdateBlogReqType, res: Response) => {
        const isUpdated = await blogsService.updateBlog({
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership
        });

        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204)
    },
    deleteBlogById: async (req: Request<{ id: string }>, res: Response) => {
        const isDeleted = await blogsService.deleteBlogById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
}

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlogById);
blogsRouter.get("/:blogId/posts", blogsController.getPostsByBlogId);

blogsRouter.post("/",
    authorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorResultMiddleware,
    blogsController.createBlog);

blogsRouter.post("/:blogId/posts",
    authorizationMiddleware,
    postTitleValidator,
    shortDescriptionValidator,
    contentValidator,
    errorResultMiddleware,
    blogsController.createPostByBlogId);

blogsRouter.put("/:id",
    authorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorResultMiddleware,
    blogsController.updateBlog);

blogsRouter.delete("/:id",
    authorizationMiddleware,
    blogsController.deleteBlogById);
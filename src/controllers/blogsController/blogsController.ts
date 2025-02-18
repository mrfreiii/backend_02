import { Router, Response } from "express";

import {
    CreateBlogReqType,
    CreateBlogResType,
    CreatePostByBlogIdReqType,
    CreatePostByBlogIdResType,
    DeleteBlogReqType,
    GetAllBlogsReqType,
    GetAllBlogsResType,
    GetAllPostsByBlogIdReqType,
    GetAllPostsByBlogIdResType,
    GetBlogByIdReqType,
    GetBlogByIdResType,
    UpdateBlogReqType
} from "./types"
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from "./validators";
import {
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "../postsController/validators";
import { blogsService } from "../../services/blogsService/blogsService";
import { postsService } from "../../services/postsService/postsService";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import {
    parseBlogsQueryParams,
    parsePostsQueryParams
} from "../../utils/parseQueryParams";
import {
    blogsQueryRepository
} from "../../repositories/blogsRepositories/blogsQueryRepository";
import {
    postsQueryRepository
} from "../../repositories/postsRepositories/postsQueryRepository";

export const blogsRouter = Router();

const blogsController = {
    getBlogs: async (req: GetAllBlogsReqType, res: GetAllBlogsResType) => {
        const parsedQuery = parseBlogsQueryParams(req.query);
        const allBlogs = await blogsQueryRepository.getAllBlogs(parsedQuery);

        res
            .status(200)
            .json(allBlogs);
    },
    getBlogById: async (req: GetBlogByIdReqType, res: GetBlogByIdResType) => {
        const foundBlog = await blogsQueryRepository.getBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundBlog);
    },
    getPostsByBlogId: async (req: GetAllPostsByBlogIdReqType, res: GetAllPostsByBlogIdResType) => {
        const parsedQuery = parsePostsQueryParams(req.query);
        const allPosts = await postsQueryRepository.getAllPosts({
            parsedQuery,
            blogId: req.params.blogId
        });

        if (!allPosts) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(allPosts);
    },
    createBlog: async (req: CreateBlogReqType, res: CreateBlogResType) => {
        const createdBlogId = await blogsService.addNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership,
        });
        const createdBlog = await blogsQueryRepository.getBlogById(createdBlogId);

        if (!createdBlog) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdBlog);
    },
    createPostByBlogId: async (req: CreatePostByBlogIdReqType, res: CreatePostByBlogIdResType) => {
        const createdPostId = await postsService.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.params.blogId,
        });
        if (!createdPostId) {
            res.sendStatus(404);
            return;
        }

        const createdPost = await postsQueryRepository.getPostById(createdPostId);
        if (!createdPost) {
            res.sendStatus(599);
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
    deleteBlogById: async (req: DeleteBlogReqType, res: Response) => {
        const isDeleted = await blogsService.deleteBlogById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
}

blogsRouter
    .route("/")
    .get(blogsController.getBlogs)
    .post(
        basicAuthMiddleware,
        blogNameValidator,
        blogDescriptionValidator,
        blogWebsiteUrlValidator,
        errorResultMiddleware,
        blogsController.createBlog);

blogsRouter
    .route("/:id")
    .get(blogsController.getBlogById)
    .put(
        basicAuthMiddleware,
        blogNameValidator,
        blogDescriptionValidator,
        blogWebsiteUrlValidator,
        errorResultMiddleware,
        blogsController.updateBlog)
    .delete(
        basicAuthMiddleware,
        blogsController.deleteBlogById);

blogsRouter
    .route("/:blogId/posts")
    .get(blogsController.getPostsByBlogId)
    .post(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        errorResultMiddleware,
        blogsController.createPostByBlogId);



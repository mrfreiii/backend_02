import { Router, Response } from "express";

import {
    blogIdValidator,
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "./validators";
import {
    CreatePostReqType,
    CreatePostResType,
    DeletePostByIdReqType,
    GetAllPostsReqType,
    GetAllPostsResType,
    GetPostByIdReqType,
    GetPostByIdResType, UpdatePostReqType
} from "./types";
import { parsePostsQueryParams } from "../../utils/parseQueryParams";
import { postsService } from "../../services/postsService/postsService";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import {
    postsQueryRepository
} from "../../repositories/postsRepositories/postsQueryRepository";

export const postsRouter = Router();

const postsController = {
    getPosts: async (req: GetAllPostsReqType, res: GetAllPostsResType) => {
        const parsedQuery = parsePostsQueryParams(req.query)
        const allPosts = await postsQueryRepository.getAllPosts({parsedQuery});

        res
            .status(200)
            .json(allPosts);
    },
    getPostById: async (req: GetPostByIdReqType, res: GetPostByIdResType) => {
        const foundPost = await postsQueryRepository.getPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundPost);
    },
    createPost: async (req: CreatePostReqType, res: CreatePostResType) => {
        const createdPostId = await postsService.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.body.blogId.trim(),
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
    updatePost: async (req: UpdatePostReqType, res: Response) => {
        const isUpdated = await postsService.updatePost({
            id: req.params.id,
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        });

        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
    deletePostById: async (req: DeletePostByIdReqType, res: Response) => {
        const isDeleted = await postsService.deletePostById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
}

postsRouter
    .route("/")
    .get(postsController.getPosts)
    .post(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        blogIdValidator,
        errorResultMiddleware,
        postsController.createPost);

postsRouter
    .route("/:id")
    .get(postsController.getPostById)
    .put(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        blogIdValidator,
        errorResultMiddleware,
        postsController.updatePost)
    .delete(
        basicAuthMiddleware,
        postsController.deletePostById);
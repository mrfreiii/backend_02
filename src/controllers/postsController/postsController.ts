import { Router, Response } from "express";

import {
    blogIdValidator,
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "./validators";
import {
    AddCommentByPostIdReqType, AddCommentByPostIdResType,
    CreatePostReqType,
    CreatePostResType,
    DeletePostByIdReqType,
    GetAllPostsReqType,
    GetAllPostsResType, GetCommentsByPostIdReqType, GetCommentsByPostIdResType,
    GetPostByIdReqType,
    GetPostByIdResType, UpdatePostReqType
} from "./types";
import {
    parseCommentsQueryParams,
    parsePostsQueryParams
} from "../../utils/parseQueryParams";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { postsService } from "../../services/postsService/postsService";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { commentContentValidator } from "../commentsController/validators";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";
import { commentsService } from "../../services/commentsService/commentsService";
import {
    postsQueryRepository
} from "../../repositories/postsRepositories/postsQueryRepository";
import {
    commentsQueryRepository
} from "../../repositories/commentsRepositories/commentsQueryRepository";

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
    createCommentByPostId: async (req: AddCommentByPostIdReqType, res: AddCommentByPostIdResType) => {
        const result = await commentsService.addNewComment({
            content: req.body.content.trim(),
            commentatorInfo: {
                userId: req.user?.id!,
                userLogin: req.user?.login!,
            },
            postId: req.params.postId,
        });
        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const createdComment = await commentsQueryRepository.getCommentById(result.data!);
        if (!createdComment) {
            res.sendStatus(HttpStatuses.ServerError_500);
            return;
        }

        res
            .status(HttpStatuses.Created_201)
            .json(createdComment);
    },
    getCommentsByPostId: async (req: GetCommentsByPostIdReqType, res: GetCommentsByPostIdResType) => {
        const post = await postsQueryRepository.getPostById(req.params.postId);
        if (!post) {
            res.sendStatus(HttpStatuses.NotFound_404);
            return;
        }

        const parsedQuery = parseCommentsQueryParams(req.query)
        const allComments = await commentsQueryRepository.getAllComments({
            parsedQuery,
            postId: req.params.postId
        });

        if (!allComments) {
            res.sendStatus(HttpStatuses.ServerError_500);
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json(allComments);
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

postsRouter
    .route("/:postId/comments")
    .get(postsController.getCommentsByPostId)
    .post(
        jwtAuthMiddleware,
        commentContentValidator,
        errorResultMiddleware,
        postsController.createCommentByPostId,
    )

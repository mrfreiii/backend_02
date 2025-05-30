import { Router } from "express";

import {
    blogIdValidator,
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "./validators";
import { ioc } from "../../composition-root";
import { PostsController } from "./postsController";
import { commentContentValidator } from "../commentsRouter/validators";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";
import { likeStatusValidator } from "../validators";

export const postsRouter = Router();
const postsController = ioc.get(PostsController)

postsRouter
    .route("/")
    .get(
        jwtAuthMiddleware(false),
        // @ts-expect-error
        postsController.getPosts.bind(postsController))
    .post(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        blogIdValidator,
        errorResultMiddleware,
        postsController.createPost.bind(postsController));

postsRouter
    .route("/:id")
    .get(
        jwtAuthMiddleware(false),
        postsController.getPostById.bind(postsController))
    .put(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        blogIdValidator,
        errorResultMiddleware,
        postsController.updatePost.bind(postsController))
    .delete(
        basicAuthMiddleware,
        postsController.deletePostById.bind(postsController));

postsRouter
    .route("/:postId/comments")
    .get(
        jwtAuthMiddleware(false),
        // @ts-ignore
        postsController.getCommentsByPostId.bind(postsController))
    .post(
        jwtAuthMiddleware(),
        commentContentValidator,
        errorResultMiddleware,
        postsController.createCommentByPostId.bind(postsController))

postsRouter
    .route("/:postId/like-status")
    .put(
        jwtAuthMiddleware(),
        likeStatusValidator,
        errorResultMiddleware,
        postsController.updatePostLikeStatus.bind(postsController))

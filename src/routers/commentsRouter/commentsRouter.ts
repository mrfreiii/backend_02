import { Router } from "express";

import { ioc } from "../../composition-root";
import { CommentsController } from "./commentsController";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { commentContentValidator, likeStatusValidator } from "./validators";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const commentsRouter = Router();
const commentsController =ioc.get(CommentsController)

commentsRouter
    .route("/:id")
    .get(
        jwtAuthMiddleware(false),
        commentsController.getCommentById.bind(commentsController))
    .put(
        jwtAuthMiddleware(),
        commentContentValidator,
        errorResultMiddleware,
        commentsController.updateComment.bind(commentsController))
    .delete(
        jwtAuthMiddleware(),
        commentsController.deleteComment.bind(commentsController));

commentsRouter
    .route("/:id/like-status")
    .put(
        jwtAuthMiddleware(),
        likeStatusValidator,
        errorResultMiddleware,
        commentsController.updateCommentLikeStatus.bind(commentsController))

import { Router } from "express";

import { ioc } from "../../composition-root";
import { commentContentValidator } from "./validators";
import { CommentsController } from "./commentsController";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const commentsRouter = Router();
const commentsController =ioc.get(CommentsController)

commentsRouter
    .route("/:id")
    .get(commentsController.getCommentById.bind(commentsController))
    .put(
        jwtAuthMiddleware,
        commentContentValidator,
        errorResultMiddleware,
        commentsController.updateComment.bind(commentsController))
    .delete(
        jwtAuthMiddleware,
        commentsController.deleteComment.bind(commentsController));

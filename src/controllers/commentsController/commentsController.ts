import { Router, Response } from "express";

import {
    DeleteCommentReqType,
    GetCommentByIdReqType,
    GetCommentByIdResType,
    UpdateCommentReqType
} from "./types";
import { HttpStatuses } from "../types";
import { resultCodeToHttpException } from "../helpers";
import { commentContentValidator } from "./validators";
import { ResultStatus } from "../../services/types";
import { commentsService } from "../../services/commentsService/commentsService";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";
import { commentsQueryRepository } from "../../repositories/commentsRepositories";

export const commentsRouter = Router();

const commentsController = {
    getCommentById: async (req: GetCommentByIdReqType, res: GetCommentByIdResType) => {
        const comment = await commentsQueryRepository.getCommentById(req.params.id);

        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404);
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json(comment);
    },
    updateComment: async (req: UpdateCommentReqType, res: Response) => {
        const comment = await commentsQueryRepository.getCommentById(req.params.id);
        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404)
            return;
        }

        if (comment.commentatorInfo.userId !== req.user?.id) {
            res.sendStatus(HttpStatuses.Forbidden_403)
            return;
        }

        const result = await commentsService.updateComment({
            id: req.params.id,
            content: req.body.content.trim(),
        });

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    },
    deleteComment: async (req: DeleteCommentReqType, res: Response) => {
        const comment = await commentsQueryRepository.getCommentById(req.params.id);
        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404)
            return;
        }

        if (comment.commentatorInfo.userId !== req.user?.id) {
            res.sendStatus(HttpStatuses.Forbidden_403)
            return;
        }

        const result = await commentsService.deleteComment(req.params.id);

        if (result.status !== ResultStatus.Success) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    },
}

commentsRouter
    .route("/:id")
    .get(commentsController.getCommentById)
    .put(
        jwtAuthMiddleware,
        commentContentValidator,
        errorResultMiddleware,
        commentsController.updateComment)
    .delete(
        jwtAuthMiddleware,
        commentsController.deleteComment);

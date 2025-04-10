import { Response } from "express";
import { inject, injectable } from "inversify";

import {
    DeleteCommentReqType,
    GetCommentByIdReqType,
    GetCommentByIdResType,
    UpdateCommentReqType,
    UpdateLikeStatusReqType
} from "./types";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { CommentsService } from "../../services/commentsService/commentsService";
import { CommentsQueryRepository } from "../../repositories/commentsRepositories";

@injectable()
export class CommentsController {
    constructor(@inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
                @inject(CommentsService) private commentsService: CommentsService) {
    }

    async getCommentById(req: GetCommentByIdReqType, res: GetCommentByIdResType) {
        const comment = await this.commentsQueryRepository.getCommentById({
            commentId:req.params.id,
            userId: req.user?.id!, // user can be not authorized
        });

        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404);
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json(comment);
    }

    async updateComment(req: UpdateCommentReqType, res: Response) {
        const comment = await this.commentsQueryRepository.getCommentById({
            commentId: req.params.id,
            userId: req.user?.id,
        });
        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404)
            return;
        }

        if (comment.commentatorInfo.userId !== req.user?.id) {
            res.sendStatus(HttpStatuses.Forbidden_403)
            return;
        }

        const result = await this.commentsService.updateComment({
            id: req.params.id,
            content: req.body.content.trim(),
        });

        if (result.status !== ResultStatus.Success_200) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    }

    async deleteComment(req: DeleteCommentReqType, res: Response) {
        const comment = await this.commentsQueryRepository.getCommentById({
            commentId: req.params.id,
            userId: req.user?.id,
        });
        if (!comment) {
            res.sendStatus(HttpStatuses.NotFound_404)
            return;
        }

        if (comment.commentatorInfo.userId !== req.user?.id) {
            res.sendStatus(HttpStatuses.Forbidden_403)
            return;
        }

        const result = await this.commentsService.deleteComment(req.params.id);

        if (result.status !== ResultStatus.Success_200) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    }


    async updateCommentLikeStatus(req: UpdateLikeStatusReqType, res: Response) {
        const result = await this.commentsService.updateCommentLikeStatus({
            commentId: req.params.id,
            newLikeStatus: req.body.likeStatus,
            userId: req.user?.id!,
        });

        if (result.status !== ResultStatus.Success_200) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    }
}

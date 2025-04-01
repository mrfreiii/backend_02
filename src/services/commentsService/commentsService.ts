import { inject, injectable } from "inversify";

import {
    CommentDbType,
    CommentViewType
} from "../../repositories/commentsRepositories/types";
import { ResultStatus, ResultType } from "../types";
import { CommentsRepository } from "../../repositories/commentsRepositories";

@injectable()
export class CommentsService {
    constructor(@inject(CommentsRepository) private commentsRepository: CommentsRepository) {}

    async addNewComment(
        dto: Omit<CommentViewType, "id" | "createdAt"> & { postId: string }
    ): Promise<ResultType<string | null>> {
        const {content, commentatorInfo, postId} = dto;

        const newComment: CommentDbType = {
            postId,
            content,
            commentatorInfo: {
                userId: commentatorInfo.userId,
                userLogin: commentatorInfo.userLogin
            },
            createdAt: (new Date()).toISOString(),
        };

        const createdCommentId = await this.commentsRepository.addNewComment(newComment);
        if (!createdCommentId) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось создать пост",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: createdCommentId,
        }
    }

    async updateComment(dto: { id: string; content: string }): Promise<ResultType<boolean | null>> {
        const isUpdated = this.commentsRepository.updateComment(dto);

        if (!isUpdated) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось обновить комментарий",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: true,
        }
    }

    async deleteComment(id: string): Promise<ResultType<boolean | null>> {
        const isDeleted = this.commentsRepository.deleteComment(id);

        if (!isDeleted) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось удалить комментарий",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: true,
        }
    }
}

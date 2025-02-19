import {
    CommentDbType,
    CommentViewType
} from "repositories/commentsRepositories/types";
import {
    commentsRepository
} from "repositories/commentsRepositories";
import { ResultStatus, ResultType } from "../types";

export const commentsService = {
    addNewComment: async (
        dto: Omit<CommentViewType, "id" | "createdAt"> & { postId: string }
    ): Promise<ResultType<string | null>> => {
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

        const createdCommentId = await commentsRepository.addNewComment(newComment);
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
    },
    updateComment: async (dto: { id: string; content: string }): Promise<ResultType<boolean | null>> => {
        const isUpdated = commentsRepository.updateComment(dto);

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
    },
    deleteComment: async (id: string): Promise<ResultType<boolean | null>> => {
        const isDeleted = commentsRepository.deleteComment(id);

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
    },
}

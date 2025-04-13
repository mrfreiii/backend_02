import { inject, injectable } from "inversify";

import { ResultStatus, ResultType } from "../types";
import { LikeStatusEnum } from "../../repositories/likesRepositories/types";
import { CommentDbType } from "../../repositories/commentsRepositories/types";
import { LikesRepository } from "../../repositories/likesRepositories";
import { CommentsRepository } from "../../repositories/commentsRepositories";
import { UsersRepository } from "../../repositories/usersRepositories";

@injectable()
export class CommentsService {
    constructor(@inject(CommentsRepository) private commentsRepository: CommentsRepository,
                @inject(UsersRepository) private usersRepository: UsersRepository,
                @inject(LikesRepository) private likesRepository: LikesRepository) {
    }

    async addNewComment(
        dto: Omit<CommentDbType, "likesCount" | "dislikesCount" | "createdAt"> & {
            postId: string
        }
    ): Promise<ResultType<string | null>> {
        const {content, commentatorInfo, postId} = dto;

        const newComment: CommentDbType = {
            postId,
            content,
            commentatorInfo: {
                userId: commentatorInfo.userId,
                userLogin: commentatorInfo.userLogin
            },
            likesCount: 0,
            dislikesCount: 0,
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

    async updateComment(dto: {
        id: string;
        content: string
    }): Promise<ResultType<boolean | null>> {
        const {id, content} = dto;

        const isUpdated = this.commentsRepository.updateComment({
            id,
            comment: {
                content
            }
        });

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

    async updateCommentLikeStatus(dto: {
        commentId: string;
        newLikeStatus: LikeStatusEnum,
        userId: string
    }): Promise<ResultType> {
        const {commentId, newLikeStatus, userId} = dto;

        const comment = await this.commentsRepository.getCommentById(commentId);
        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: "Комментарий не найден",
                extensions: [],
                data: null,
            }
        }

        const currentLike = await this.likesRepository.getLikeByUserIdAndEntityId({
            userId,
            entityId: commentId
        })

        const user = await this.usersRepository.getUserById(userId);

        if (!currentLike && newLikeStatus !== LikeStatusEnum.None) {
            const newLikeId = await this.likesRepository.addLike({
                status: newLikeStatus,
                userId,
                userLogin: user?.accountData?.login || "unknown",
                entityId: commentId,
                addedAt: new Date().getTime(),
            })
            if (!newLikeId) {
                return {
                    status: ResultStatus.ServerError,
                    errorMessage: "Не удалось добавить лайк",
                    extensions: [],
                    data: null,
                }
            }
        }

        if (currentLike && currentLike?.status !== newLikeStatus && newLikeStatus !== LikeStatusEnum.None) {
            const isUpdated = await this.likesRepository.updateLike({
                likeId: currentLike._id,
                newLikeStatus,
            })
            if (!isUpdated) {
                return {
                    status: ResultStatus.ServerError,
                    errorMessage: "Не удалось добавить лайк",
                    extensions: [],
                    data: null,
                }
            }
        }

        if (currentLike && newLikeStatus === LikeStatusEnum.None) {
            const isDeleted = await this.likesRepository.deleteLike(currentLike._id)
            if (!isDeleted) {
                return {
                    status: ResultStatus.ServerError,
                    errorMessage: "Не удалось добавить лайк",
                    extensions: [],
                    data: null,
                }
            }
        }

        let likesCount = comment.likesCount || 0;
        let dislikesCount = comment.dislikesCount || 0;

        switch (newLikeStatus) {
            case LikeStatusEnum.None:
                if (!currentLike) break;

                if (currentLike.status === LikeStatusEnum.Like) {
                    likesCount -= 1;
                }

                if (currentLike.status === LikeStatusEnum.Dislike) {
                    dislikesCount -= 1;
                }

                break;
            case LikeStatusEnum.Like:
                if (currentLike?.status !== LikeStatusEnum.Like) {
                    likesCount += 1;
                }
                if (currentLike?.status === LikeStatusEnum.Dislike) {
                    dislikesCount -= 1;
                }
                break;

            case LikeStatusEnum.Dislike:
                if (currentLike?.status !== LikeStatusEnum.Dislike) {
                    dislikesCount += 1;
                }
                if (currentLike?.status === LikeStatusEnum.Like) {
                    likesCount -= 1;
                }
                break;
        }

        const isUpdated = await this.commentsRepository.updateComment({
            id: commentId,
            comment: {
                likesCount,
                dislikesCount
            }
        });
        if (!isUpdated) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось обновить лайки",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null,
        }
    }
}

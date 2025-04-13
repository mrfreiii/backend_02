import { inject, injectable } from "inversify";

import {
    BlogsQueryRepository,
    BlogsRepository
} from "../../repositories/blogsRepositories";
import { PostsRepository } from "../../repositories/postsRepositories";
import { UsersRepository } from "../../repositories/usersRepositories";
import { LikesRepository } from "../../repositories/likesRepositories";
import { ResultStatus, ResultType } from "../types";
import { addPostDTO, updatePostDTO } from "./dtoTypes";
import { LikeStatusEnum } from "../../repositories/likesRepositories/types";
import { NewestLikesType, PostDbType } from "../../repositories/postsRepositories/types";

@injectable()
export class PostsService {
    constructor(@inject(PostsRepository) private postsRepository: PostsRepository,
                @inject(LikesRepository) private likesRepository: LikesRepository,
                @inject(BlogsRepository) private blogsRepository: BlogsRepository,
                @inject(UsersRepository) private usersRepository: UsersRepository,
                @inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository) {
    }

    async addNewPost(dto: addPostDTO): Promise<string | undefined> {
        const {title, shortDescription, content, blogId} = dto;

        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            return;
        }

        const newPost: PostDbType = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: (new Date()).toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                newestLikes: []
            }
        };

        return this.postsRepository.addNewPost(newPost);
    }

    async updatePost(dto: updatePostDTO): Promise<boolean> {
        const {postId, title, shortDescription, content, blogId} = dto;

        const blog = await this.blogsRepository.getBlogById(blogId);
        if (!blog) {
            return false;
        }

        const post = await this.postsRepository.getPostById(postId);
        if (!post) {
            return false;
        }

        const updatedPost: Partial<PostDbType> = {
            title: title.trim(),
            shortDescription: shortDescription.trim(),
            content: content.trim(),
            blogId: blogId,
            blogName: blog.name,
        }

        return this.postsRepository.updatePost({postId, updatedPost});
    }

    async deletePostById(id: string): Promise<boolean> {
        return this.postsRepository.deletePostById(id);
    }

    async updatePostLikeStatus(dto: {
        postId: string;
        newLikeStatus: LikeStatusEnum,
        userId: string
    }): Promise<ResultType> {
        const {postId, newLikeStatus, userId} = dto;

        const post = await this.postsRepository.getPostById(postId);
        if (!post) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: "Пост не найден",
                extensions: [],
                data: null,
            }
        }

        const currentLike = await this.likesRepository.getLikeByUserIdAndEntityId({
            userId,
            entityId: postId
        })

        const user = await this.usersRepository.getUserById(userId);

        if (!currentLike && newLikeStatus !== LikeStatusEnum.None) {
            const newLikeId = await this.likesRepository.addLike({
                status: newLikeStatus,
                userId,
                userLogin: user?.accountData.login || "unknown",
                entityId: postId,
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

        let likesCount = post.extendedLikesInfo.likesCount;
        let dislikesCount = post.extendedLikesInfo.dislikesCount;
        let newestLikes: NewestLikesType[] = post.extendedLikesInfo.newestLikes;
        let needToRecalculateNewestLikes = false;

        switch (newLikeStatus) {
            case LikeStatusEnum.None:
                if (!currentLike) break;

                if (currentLike.status === LikeStatusEnum.Like) {
                    likesCount -= 1;
                    if(newestLikes.some((newestLike)=>newestLike.userId === userId)){
                        needToRecalculateNewestLikes = true;
                    }
                }

                if (currentLike.status === LikeStatusEnum.Dislike) {
                    dislikesCount -= 1;
                }

                break;
            case LikeStatusEnum.Like:
                if (currentLike?.status !== LikeStatusEnum.Like) {
                    likesCount += 1;
                    needToRecalculateNewestLikes = true;
                }
                if (currentLike?.status === LikeStatusEnum.Dislike) {
                    dislikesCount -= 1;
                    needToRecalculateNewestLikes = true;
                }
                break;

            case LikeStatusEnum.Dislike:
                if (currentLike?.status !== LikeStatusEnum.Dislike) {
                    dislikesCount += 1;
                }
                if (currentLike?.status === LikeStatusEnum.Like) {
                    likesCount -= 1;
                    needToRecalculateNewestLikes = true;
                }
                break;
        }

        if(needToRecalculateNewestLikes){
            const lastThreeLikes = await this.likesRepository.getLastThreeLikesForEntity(postId);

            newestLikes = lastThreeLikes?.map((lastLike) => {
                const lastLikeResult: NewestLikesType = {
                    addedAt: new Date(lastLike.addedAt).toISOString(),
                    userId: lastLike.userId,
                    login: lastLike.userLogin,
                }
                return lastLikeResult;
            }) || []
        }

        const isUpdated = await this.postsRepository.updatePost({
            postId,
            updatedPost: {
                extendedLikesInfo: {
                    likesCount,
                    dislikesCount,
                    newestLikes,
                },
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
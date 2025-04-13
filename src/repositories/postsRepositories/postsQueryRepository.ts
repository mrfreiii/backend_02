import { inject, injectable } from "inversify";
import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { LikeStatusEnum } from "../likesRepositories/types";
import { PostQueryType } from "../../routers/postsRouter/types";
import { NewestLikesType, PostDbType, PostViewType } from "./types";
import { LikesRepository } from "../likesRepositories";
import { PostModel } from "../../models/postModel/post.entity";

@injectable()
export class PostsQueryRepository {
    constructor(@inject(LikesRepository) private likesRepository: LikesRepository) {
    }

    async getAllPosts(
        {
            parsedQuery,
            blogId,
            userId,
        }: {
            parsedQuery: PostQueryType,
            blogId?: string,
            userId: string | undefined;
        }): Promise<WithPaginationType<PostViewType> | undefined> {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (blogId) {
            filter.blogId = blogId;
        }

        const allPosts = await PostModel
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
        const postCount = await this.getPostsCount(filter);

        const items: PostViewType[] = []
        for (let i = 0; i < allPosts.length; i++) {
            const item = await this._mapPostDbTypeToPostViewType({
                userId,
                post: allPosts[i]
            })
            items.push(item)
        }

        return {
            pagesCount: Math.ceil(postCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postCount,
            items,
        }
    }

    async getPostsCount(filter: { blogId?: string }): Promise<number> {
        return PostModel.countDocuments(filter);
    }

    async getPostById(
        {
            postId,
            userId,
        }:{
            postId: string;
            userId: string | undefined;
        }): Promise<PostViewType | undefined> {
        try {
            const post = await PostModel.findOne({_id: new ObjectId(postId)});
            if (!post) {
                return;
            }

            return this._mapPostDbTypeToPostViewType({post, userId});
        } catch {
            return;
        }
    }

    async _mapPostDbTypeToPostViewType(
        {
            post,
            userId
        }: {
            post: WithId<PostDbType>;
            userId: string | undefined;
        }): Promise<PostViewType> {
        const {
            _id,
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt,
            extendedLikesInfo
        } = post;

        let myStatus = LikeStatusEnum.None;
        if (userId) {
            const userLike = await this.likesRepository.getLikeByUserIdAndEntityId({
                entityId: _id.toString(),
                userId,
            })
            myStatus = userLike?.status ?? myStatus;
        }

        const newestLikes = extendedLikesInfo.newestLikes.map((newestLike)=>{
            const result: NewestLikesType = {
                addedAt: newestLike.addedAt,
                userId: newestLike.userId,
                login: newestLike.login,
            }
            return result;
        })

        return {
            id: _id.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt,
            extendedLikesInfo: {
                likesCount: extendedLikesInfo.likesCount,
                dislikesCount: extendedLikesInfo.dislikesCount,
                newestLikes,
                myStatus,
            }
        }
    }
}
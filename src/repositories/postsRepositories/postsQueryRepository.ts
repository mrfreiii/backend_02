import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { postCollection } from "../../db/mongodb";
import { PostDbType, PostViewType } from "./types";
import { PostQueryType } from "../../routers/postsRouter/types";
import { injectable } from "inversify";

@injectable()
export class PostsQueryRepository {
    async getAllPosts({parsedQuery, blogId}: { parsedQuery: PostQueryType, blogId?: string }): Promise<WithPaginationType<PostViewType> | undefined> {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (blogId) {
            filter.blogId = blogId;
        }

        const allPosts = await postCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const postCount = await this.getPostsCount(filter);

        return {
            pagesCount: Math.ceil(postCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postCount,
            items: allPosts?.map((post) => this._mapPostDbTypeToPostViewType(post))
        }
    }

    async getPostsCount(filter: {blogId?: string}): Promise<number> {
        return postCollection.countDocuments(filter);
    }

    async getPostById(id: string): Promise<PostViewType | undefined> {
        try {
            const post = await postCollection.findOne({_id: new ObjectId(id)});
            if (!post) {
                return;
            }

            return this._mapPostDbTypeToPostViewType(post);
        } catch {
            return;
        }
    }

    _mapPostDbTypeToPostViewType(post: WithId<PostDbType>): PostViewType {
        const {_id, title, shortDescription, content, blogId, blogName, createdAt} = post;

        return {
            id: _id.toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt
        }
    }
}
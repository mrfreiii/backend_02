import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { postCollection } from "../../db/mongodb";
import { PostDbType, PostViewType } from "./types";
import { PostQueryType } from "../../controllers/postsController/types";
import { blogsQueryRepository } from "../blogsRepositories/blogsQueryRepository";

export const postsQueryRepository = {
    getAllPosts: async ({parsedQuery, blogId}: { parsedQuery: PostQueryType, blogId?: string }): Promise<WithPaginationType<PostViewType> | undefined> => {
        if(blogId){
            const blog = await blogsQueryRepository.getBlogById(blogId);
            if (!blog) {
                return;
            }
        }

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
        const postCount = await postsQueryRepository.getPostsCount(filter);

        return {
            pagesCount: Math.ceil(postCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postCount,
            items: allPosts?.map((post) => postsQueryRepository._mapPostDbTypeToPostViewType(post))
        }
    },
    getPostsCount: async (filter: {blogId?: string}): Promise<number> => {
        return postCollection.countDocuments(filter);
    },
    getPostById: async (id: string): Promise<PostViewType | undefined> => {
        try {
            const post = await postCollection.findOne({_id: new ObjectId(id)});
            if (!post) {
                return;
            }

            return postsQueryRepository._mapPostDbTypeToPostViewType(post);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _mapPostDbTypeToPostViewType: (post: WithId<PostDbType>): PostViewType => {
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
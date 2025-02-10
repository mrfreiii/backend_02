import { WithPagination } from "../types";
import { PostQueryType, PostType } from "./types";
import { postsRepository } from "./postsRepository";
import { blogsService } from "../blogs/blogsService";
import { replaceMongo_idByid } from "../utils/mapDbResult";

export const postsService = {
    getAllPosts: async (parsedQuery: PostQueryType): Promise<WithPagination<PostType>> => {
        const allPosts = await postsRepository._getAllPosts(parsedQuery);
        const postsCount = await postsRepository._getPostsCount();

        return {
            pagesCount: Math.ceil(postsCount / parsedQuery.pageSize),
            page: parsedQuery.pageNumber,
            pageSize: parsedQuery.pageSize,
            totalCount: postsCount,
            items: allPosts.map((post) => replaceMongo_idByid(post))
        }
    },
    getPostById: async (id: string): Promise<PostType | undefined> => {
        const result = await postsRepository._getPostById(id);
        if (!result) {
            return;
        }

        return replaceMongo_idByid(result);
    },
    addNewPost: async (
        {
            title,
            shortDescription,
            content,
            blogId,
        }:
            {
                title: string;
                shortDescription: string;
                content: string;
                blogId: string;
            }
    ): Promise<PostType | undefined> => {
        const blog = await blogsService.getBlogById(blogId);
        if (!blog) {
            return;
        }

        const newPost: PostType = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: (new Date()).toISOString(),
        };

        const createdPostId = await postsRepository._addNewPost(newPost);
        return postsService.getPostById(createdPostId);
    },
    updatePost: async (
        {
            id,
            title,
            shortDescription,
            content,
            blogId,
        }:
            {
                id: string;
                title: string;
                shortDescription: string;
                content: string;
                blogId: string;
            }
    ): Promise<boolean> => {
        const foundBlog = await blogsService.getBlogById(blogId);
        if (!foundBlog) {
            return false;
        }

        const updatedPost: PostType = {
            title: title.trim(),
            shortDescription: shortDescription.trim(),
            content: content.trim(),
            blogId: blogId,
            blogName: foundBlog.name,
        }

        return postsRepository._updatePost({id, updatedPost});
    },
    deletePostById: async (id: string): Promise<boolean> => {
        return postsRepository._deletePostById(id);
    },
}
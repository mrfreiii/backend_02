import { BlogType } from "./types";
import { blogsRepository } from "./blogsRepository";
import { QueryType, WithPagination } from "../types";
import { replaceMongo_idByid } from "../utils/mapDbResult";

export const blogsService = {
    getAllBlogs: async (parsedQuery: QueryType): Promise<WithPagination<BlogType>> => {
        const allBlogs = await blogsRepository._getAllBlogs(parsedQuery);
        const blogsCount = await blogsRepository._getBlogsCount(parsedQuery.searchNameTerm);

        return {
            pagesCount: Math.ceil(blogsCount / parsedQuery.pageSize),
            page: parsedQuery.pageNumber,
            pageSize: parsedQuery.pageSize,
            totalCount: blogsCount,
            items: allBlogs.map((blog) => replaceMongo_idByid(blog))
        }
    },
    getBlogById: async (id: string): Promise<BlogType | undefined> => {
        const result = await blogsRepository._getBlogById(id);
        if (!result) {
            return;
        }

        return replaceMongo_idByid(result);
    },
    addNewBlog: async (
        {
            name,
            description,
            websiteUrl,
            isMembership,
        }:
            {
                name: string;
                description: string;
                websiteUrl: string;
                isMembership?: boolean;
            }): Promise<BlogType | undefined> => {
        const newBlog: BlogType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
            createdAt: (new Date()).toISOString(),
        };

        const createdBlogId = await blogsRepository._addNewBlog(newBlog);
        return blogsService.getBlogById(createdBlogId);
    },
    updateBlog: async (
        {
            id,
            name,
            description,
            websiteUrl,
            isMembership,
        }: {
            id: string;
            name: string;
            description: string;
            websiteUrl: string;
            isMembership?: boolean;
        }): Promise<boolean> => {
        const updatedBlog: Omit<BlogType, "createdAt"> = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
        }

        return blogsRepository._updateBlog({id, updatedBlog});
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        return blogsRepository._deleteBlogById(id);
    },
}
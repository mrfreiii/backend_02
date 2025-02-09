import { ObjectId } from "mongodb";

import { BlogType } from "./types";
import { blogCollection } from "../db/mongodb";
import { replaceMongo_idByid } from "../utils/mapDbResult";
import { QueryType, WithPagination } from "../types";
import { blogsRepository } from "./blogsRepository";

export const blogsService = {
    clearDB: async () => {
        return blogCollection.drop();
    },
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
        try {
            const result = await blogCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return replaceMongo_idByid(result);
        } catch (e) {
            console.log(e);
            return;
        }
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
            }): Promise<string> => {
        const newBlog: BlogType = {
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: typeof isMembership === "boolean" ? isMembership : false,
            createdAt: (new Date()).toISOString(),
        };

        const createdBlog = await blogCollection.insertOne(newBlog);
        return createdBlog?.insertedId?.toString();
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

        try {
            const result = await blogCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedBlog}
            );

            return result.matchedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        try{
            const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
}
import { ObjectId, SortDirection, WithId } from "mongodb";

import { WithPaginationType } from "../../types";
import { blogCollection } from "../../db/mongodb";
import { BlogDbType, BlogViewType } from "./types";
import { BlogQueryType } from "../../controllers/blogsController/types";

export const blogsQueryRepository = {
    getAllBlogs: async (parsedQuery: BlogQueryType): Promise<WithPaginationType<BlogViewType>> => {
        const {searchNameTerm, sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }

        const allBlogs = await blogCollection
            .find(filter)
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        const blogsCount = await blogsQueryRepository.getBlogsCount(searchNameTerm);

        return {
            pagesCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            items: allBlogs?.map((blog) => blogsQueryRepository._mapBlogDbTypeToBlogViewType(blog))
        }

    },
    getBlogsCount: async (searchNameTerm: string | null): Promise<number> => {
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }

        return blogCollection.countDocuments(filter);
    },
    getBlogById: async (id: string): Promise<BlogViewType | undefined> => {
        try {
            const blog = await blogCollection.findOne({_id: new ObjectId(id)});
            if (!blog) {
                return;
            }

            return blogsQueryRepository._mapBlogDbTypeToBlogViewType(blog);
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _mapBlogDbTypeToBlogViewType: (blog: WithId<BlogDbType>): BlogViewType => {
        const {_id, name, description, websiteUrl, isMembership, createdAt} = blog;

        return {
            id: _id.toString(),
            name,
            description,
            websiteUrl,
            isMembership,
            createdAt
        }
    }
}
import { BlogType } from "../db/types";
import { blogCollection } from "../db/mongodb";

export const blogsRepositoryMongoDb = {
    clearDB: async () => {
        // blogsDB = [];
    },
    getAllBlogs: async () => {
        // return blogsDB;
        return blogCollection.find({}).toArray();
    },
    getBlogById: async (id: string) => {
        // return blogsDB.find((blog) => blog.id === id);
    },
    addNewBlog: async ({
                     name,
                     description,
                     websiteUrl
                 }: { name: string; description: string; websiteUrl: string }) => {
        // const createdBlogId = `${+Date.now()}`;
        // const newBlog: BlogType = {
        //     id: createdBlogId,
        //     name: name.trim(),
        //     description: description.trim(),
        //     websiteUrl: websiteUrl.trim(),
        // };
        //
        // blogsDB.push(newBlog);
        // return createdBlogId;
    },
    updateBlog: async (
        {
            id,
            name,
            description,
            websiteUrl
        }: {
            id: string;
            name: string;
            description: string;
            websiteUrl: string
        }): Promise<boolean> => {
        // const foundBlog = blogsRepository.getBlogById(id);
        // if (!foundBlog) {
        //     return false;
        // }
        //
        // foundBlog.name = name.trim();
        // foundBlog.description = description.trim();
        // foundBlog.websiteUrl = websiteUrl.trim();
        //
        // return true;
        return Promise.resolve(true);
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        // const foundBlog = blogsRepository.getBlogById(id);
        // if (!foundBlog) {
        //     return false;
        // }
        //
        // blogsDB = blogsDB.filter((blog)=> blog.id !== id);
        // return true;
        return Promise.resolve(true);
    },
}
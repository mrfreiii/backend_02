import { BlogType } from "../db/types";

let blogsDB: BlogType[] = []

export const blogsRepositoryInMemory = {
    clearDB: async () => {
        blogsDB = [];
    },
    getAllBlogs: async () => {
        return blogsDB;
    },
    getBlogById: async (id: string) => {
        return blogsDB.find((blog) => blog.id === id);
    },
    addNewBlog: async ({
                     name,
                     description,
                     websiteUrl
                 }: { name: string; description: string; websiteUrl: string }): Promise<string> => {
        const createdBlogId = `${Date.now() + (Math.random() * 10000).toFixed()}`;
        const newBlog: BlogType = {
            id: createdBlogId,
            name: name.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            isMembership: false
        };

        blogsDB.push(newBlog);
        return createdBlogId;
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
        const foundBlog = await blogsRepositoryInMemory.getBlogById(id);
        if (!foundBlog) {
            return false;
        }

        foundBlog.name = name.trim();
        foundBlog.description = description.trim();
        foundBlog.websiteUrl = websiteUrl.trim();

        return true;
    },
    deleteBlogById: async (id: string): Promise<boolean> => {
        const foundBlog = await blogsRepositoryInMemory.getBlogById(id);
        if (!foundBlog) {
            return false;
        }

        blogsDB = blogsDB.filter((blog)=> blog.id !== id);
        return true;
    },
}
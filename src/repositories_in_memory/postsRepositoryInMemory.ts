import { blogsRepositoryInMemory } from "./blogsRepositoryInMemory";
import { PostType } from "../db/types";

let postsDB: PostType[] = [
    {
        id: "10888",
        title: "some post title 1",
        shortDescription: "some post description 1",
        content: "some post content 1",
        blogId: "99101",
        blogName: "some blog name 1",
    },
    {
        id: "10999",
        title: "some post title 2",
        shortDescription: "some post description 2",
        content: "some post content 2",
        blogId: "99102",
        blogName: "some blog name 2",
    },
]

export const postsRepositoryInMemory = {
    clearDB: async () => {
        postsDB = [];
        return Promise.resolve();
    },
    getAllPosts: async () => {
        return Promise.resolve(postsDB);
    },
    getPostById: async (id: string) => {
        const post = postsDB.find((post) => post.id === id);
        return Promise.resolve(post);
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
    ) => {
        const blog = await blogsRepositoryInMemory.getBlogById(blogId);
        if (!blog) {
            return Promise.resolve(undefined);
        }

        const createdPostId = `${Date.now() + (Math.random() * 10000).toFixed()}`;
        const newPost: PostType = {
            id: createdPostId,
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
        };

        postsDB.push(newPost);
        return Promise.resolve(createdPostId);
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
        const foundPost = await postsRepositoryInMemory.getPostById(id);
        if (!foundPost) {
            return false;
        }

        const foundBlog = await blogsRepositoryInMemory.getBlogById(blogId);
        if (!foundBlog) {
            return false;
        }

        foundPost.title = title.trim();
        foundPost.shortDescription = shortDescription.trim();
        foundPost.content = content.trim();
        foundPost.blogId = blogId.trim();
        foundPost.blogName = foundBlog.name;

        return Promise.resolve(true);
    },
    deletePostById: async (id: string): Promise<boolean> => {
        const foundPost = postsDB.find((post) => post.id === id);
        if(!foundPost){
            return Promise.resolve(false);
        }

        postsDB = postsDB.filter((post) => post.id !== id);
        return Promise.resolve(true);
    },
}
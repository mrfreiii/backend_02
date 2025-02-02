import { blogsRepository } from "./blogsRepository";

export type PostType = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
}

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

export const postsRepository = {
    clearDB: () => {
        postsDB = [];
    },
    getAllPosts: () => {
        return postsDB;
    },
    getPostById: (id: string) => {
        return postsDB.find((post) => post.id === id);
    },
    addNewPost: (
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
        const blogName = blogsRepository.getBlogById(blogId)?.name;
        if (!blogName) {
            return;
        }

        const createdPostId = `${+Date.now()}`;
        const newPost: PostType = {
            id: createdPostId,
            title,
            shortDescription,
            content,
            blogId,
            blogName,
        };

        postsDB.push(newPost);
        return createdPostId;
    },
    updatePost: (
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
    ): boolean => {
        const foundPost = postsRepository.getPostById(id);
        if (!foundPost) {
            return false;
        }

        const foundBlog = blogsRepository.getBlogById(blogId);
        if (!foundBlog) {
            return false;
        }

        foundPost.title = title.trim();
        foundPost.shortDescription = shortDescription.trim();
        foundPost.content = content.trim();
        foundPost.blogId = blogId.trim();
        foundPost.blogName = foundBlog.name;

        return true;
    },
    deletePostById: (id: string): boolean => {
        const foundPost = postsDB.find((post) => post.id === id);
        if(!foundPost){
            return false;
        }

        postsDB = postsDB.filter((post) => post.id !== id);
        return true;
    },
}
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
        if(!blogName){
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
}
export type BlogType = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
}

let blogsDB: BlogType[] = [
    {
        id: "1111",
        name: "some blog name 1",
        description: "some blog name 1",
        websiteUrl: "https://some.url.com",
    },
    {
        id: "2222",
        name: "some blog name 1",
        description: "some blog name 1",
        websiteUrl: "https://some.url.com",
    },
]

export const blogsRepository = {
    clearDB: () => {
        blogsDB = [];
    },
    getAllBlogs: () => {
        return blogsDB;
    },
    getBlogById: (id: string) => {
        return blogsDB.find((blog) => blog.id === id);
    },
    addNewBlog: ({ name, description, websiteUrl }:{ name: string; description: string; websiteUrl: string }) => {
        const createdBlogId = `${+Date.now()}`;
        const newBlog: BlogType = {
            id: createdBlogId,
            name,
            description,
            websiteUrl,
        };

        blogsDB.push(newBlog);
        return createdBlogId;
    },
}
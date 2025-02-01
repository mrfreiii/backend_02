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
    addNewBlog: ({ name, description, websiteUrl }:{ name: string; description: string; websiteUrl: string }) => {
        const newBlog: BlogType = {
            id: `${+Date.now()}`,
            name,
            description,
            websiteUrl,
        };

        blogsDB.push(newBlog);
        return newBlog;
    },
}
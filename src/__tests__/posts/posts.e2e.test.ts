import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories,
} from "../../utils/testHelpers";
import { SETTINGS } from "../../settings";
import { createTestPosts } from "./helpers";
import { createTestBlogs } from "../blogs/helpers";
import { PostViewType } from "../../repositories/postsRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/basicAuthMiddleware";

describe("get all /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.items.length).toBe(0);
    })

    it("should get not empty array", async () => {
        const createdBlog = (await createTestBlogs())[0];
        const createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0]).toEqual({
            ...createdPost,
            blogName: createdBlog.name,
        });
    })
})

describe("get post by id /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should get not empty array", async () => {
        const createdBlog = (await createTestBlogs())[0];
        const createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${createdPost?.id}`)
            .expect(200)

        expect(res.body).toEqual({
            ...createdPost,
            blogName: createdBlog.name,
        });
    })
})

describe("create post /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for title, shortDescription, content, and blogId are not string", async () => {
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: null as unknown as string,
            shortDescription: null as unknown as string,
            content: null as unknown as string,
            blogId: null as unknown as string,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(4);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "title",
                    message: "value must be a string"
                },
                {
                    field: "shortDescription",
                    message: "value must be a string"
                },
                {
                    field: "content",
                    message: "value must be a string"
                },
                {
                    field: "blogId",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for title, shortDescription, and content too short", async () => {
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: " ",
            shortDescription: " ",
            content: " ",
            blogId: null as unknown as string,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(4);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "title",
                    message: "length must be: min 1, max 30"
                },
                {
                    field: "shortDescription",
                    message: "length must be: min 1, max 100"
                },
                {
                    field: "content",
                    message: "length must be: min 1, max 1000"
                },
                {
                    field: "blogId",
                    message: "value must be a string"
                },

            ]
        );
    })

    it("should return 400 for title too long", async () => {
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "1234567890123456789012345678901 ",
            shortDescription: "123",
            content: "123",
            blogId: null as unknown as string,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "title",
                    message: "length must be: min 1, max 30"
                },
                {
                    field: "blogId",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for blog with blogId no exist", async () => {
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "title",
            shortDescription: "shortDescription",
            content: "content",
            blogId: "123",
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages[0]).toEqual(
            {
                field: "blogId",
                message: "blog not found"
            }
        );
    })

    it("should create a post", async () => {
        const createdBlog = (await createTestBlogs())[0];

        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: createdBlog.id,
        }

        const postRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(201)

        expect(postRes.body).toEqual(
            {
                ...newPost,
                id: expect.any(String),
                blogName: createdBlog.name,
                createdAt: expect.any(String)
            }
        );
    })
})

describe("update post by id /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.POSTS}/7777`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for invalid title and no shortDescription", async () => {
        const createdBlog = (await createTestBlogs())[0];
        const createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        const updatedPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "shortDescription"> = {
            title: "1234567890123456789012345678901",
            content: "content1",
            blogId: createdBlog?.id as string,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost?.id}`)
            .send(updatedPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "title",
                    message: "length must be: min 1, max 30"
                },
                {
                    field: "shortDescription",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should update a post", async () => {
        const createdBlogs = await createTestBlogs(2);
        const createdPost = (await createTestPosts({blogId: createdBlogs[0].id}))[0];

        const updatedPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "new title",
            shortDescription: "new description",
            content: "new content",
            blogId: createdBlogs[1]?.id,
        }

        await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost?.id}`)
            .send(updatedPost)
            .expect(204)

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${createdPost?.id}`)
            .expect(200)

        expect(res.body).toEqual({
            ...updatedPost,
            id: createdPost?.id,
            blogName: createdBlogs[1].name,
            createdAt: createdPost.createdAt
        });
    })
})

describe("delete post by id /posts", () => {
    connectToTestDBAndClearRepositories();

    let postForDeletion: PostViewType;

    it("should return not empty array", async () => {
        const createdBlog = (await createTestBlogs())[0];
        postForDeletion = (await createTestPosts({blogId: createdBlog.id}))[0];

        const checkRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(checkRes.body.items.length).toBe(1);
        expect(checkRes.body.items[0]).toEqual(postForDeletion);
    })


    it("should return 404 for non existent post", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.POSTS}/7777`)
            .expect(404)
    })


    it("should return empty array", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.POSTS}/${postForDeletion?.id}`)
            .expect(204)

        const checkRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(checkRes.body.items.length).toBe(0);
    })
})
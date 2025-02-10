import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories
} from "./test-helpers";
import { SETTINGS } from "../settings";
import { BlogType } from "../blogs/types";
import { PostType } from "../posts/types";
import { blogsService } from "../blogs/blogsService";
import { postsService } from "../posts/postsService";
import { AUTH_ERROR_MESSAGES } from "../middlewares/authorizationMiddleware";

describe("get all /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.items.length).toBe(0);
    })

    it("should get not empty array", async () => {
        const newBlog: BlogType = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true
        }
        const createdBlog = await blogsService.addNewBlog(newBlog);

        const newPost: Omit<PostType, "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlog?.id as string,
        }
        const createdPost = await postsService.addNewPost(newPost)

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0]).toEqual({
            ...newPost,
            id: createdPost?.id,
            blogName: newBlog.name,
            createdAt: expect.any(String)
        });
    })
})

describe("get post by id /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should get not empty array", async () => {
        const newBlog: BlogType = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true
        }
        const createdBlog = await blogsService.addNewBlog(newBlog);

        const newPost: Omit<PostType, "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlog?.id as string,
        }
        const createdPost = await postsService.addNewPost(newPost)

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${createdPost?.id}`)
            .expect(200)

        expect(res.body).toEqual({
            ...newPost,
            id: createdPost?.id,
            blogName: newBlog.name,
            createdAt: expect.any(String)
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
        const newPost: Omit<PostType, "blogName"> = {
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
        const newPost: Omit<PostType, "blogName"> = {
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
        const newPost: Omit<PostType, "blogName"> = {
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
        const newPost: Omit<PostType, "blogName"> = {
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
        const newBlog: BlogType = {
            name: "test name",
            description: "test description",
            websiteUrl: "https://mytestsite.com",
            isMembership: true
        }

        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)

        expect(blogRes.body).toEqual(
            {
                ...newBlog,
                id: expect.any(String),
                createdAt: expect.any(String)
            }
        );

        const newPost: Omit<PostType, "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: blogRes.body.id,
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
                blogName: newBlog.name,
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
        const blog: BlogType = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: false
        };
        const createdBlog = await blogsService.addNewBlog(blog);

        const post: Omit<PostType, "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: createdBlog?.id as string,
        }
        const createdPost = await postsService.addNewPost(post);

        const updatedPost: Omit<PostType, "blogName" | "shortDescription"> = {
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
        const blog1: BlogType = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: true
        };
        const blog2: BlogType = {
            name: "test name 2",
            description: "test description 2",
            websiteUrl: "https://mytestsite2.com",
            isMembership: true
        };

        const createdBlog1 = await blogsService.addNewBlog(blog1);
        const createdBlog2 = await blogsService.addNewBlog(blog2);

        const newPost: Omit<PostType,"blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: createdBlog1?.id as string,
        }
        const createdPost = await postsService.addNewPost(newPost);

        const updatedPost: Omit<PostType, "blogName"> = {
            title: "title2",
            shortDescription: "shortDescription2",
            content: "content2",
            blogId: createdBlog2?.id as string,
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
            blogName: blog2.name,
            createdAt: expect.any(String)
        });
    })
})

describe("delete post by id /posts", () => {
    connectToTestDBAndClearRepositories();

    let postForDeletion: PostType | undefined;

    it("should return not empty array", async () => {
        const blog: BlogType = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: false
        };
        const createdBlog = await blogsService.addNewBlog(blog);

        const post: Omit<PostType, "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: createdBlog?.id as string,
        }
        postForDeletion = await postsService.addNewPost(post);

        const checkRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(checkRes.body.items.length).toBe(1);
        expect(checkRes.body.items[0]).toEqual({
            ...post,
            id: postForDeletion?.id,
            blogName: blog.name,
            createdAt: expect.any(String)
        });
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
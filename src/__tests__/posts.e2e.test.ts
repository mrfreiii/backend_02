import { req, validAuthHeader } from "./test-helpers";
import { SETTINGS } from "../settings";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";
import { postsRepository, PostType } from "../repositories/postsRepository";
import { AUTH_ERROR_MESSAGES } from "../middlewares/authorizationMiddleware";

describe("get all /posts", () => {
    beforeAll(() => {
        postsRepository.clearDB();
    })

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.length).toBe(0);
    })

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogType, "id"> = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con"
        }
        const createdBlogId = blogsRepository.addNewBlog(newBlog);

        const newPost: Omit<PostType, "id" | "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlogId,
        }
        const createdPostId = postsRepository.addNewPost(newPost)

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.length).toBe(1);
        expect(res.body[0]).toEqual({
            ...newPost,
            id: createdPostId,
            blogName: newBlog.name,
        });
    })
})

describe("get post by id /posts", () => {
    beforeAll(() => {
        postsRepository.clearDB();
    })

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogType, "id"> = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con"
        }
        const createdBlogId = blogsRepository.addNewBlog(newBlog);

        const newPost: Omit<PostType, "id" | "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlogId,
        }
        const createdPostId = postsRepository.addNewPost(newPost)

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${createdPostId}`)
            .expect(200)

        expect(res.body).toEqual({
            ...newPost,
            id: createdPostId,
            blogName: newBlog.name,
        });
    })
})

describe("create post /posts", () => {
    beforeAll(() => {
        postsRepository.clearDB();
    })

    it("should return 401 for request without auth header", async () => {
        const newPost: Omit<PostType, "id" | "blogName"> = {
            title: "new post title",
            shortDescription: "new shortDescription",
            content: "new content",
            blogId: "any"
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for title, shortDescription, content, and blogId are not string", async () => {
        const newPost: Omit<PostType, "id" | "blogName"> = {
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
        const newPost: Omit<PostType, "id" | "blogName"> = {
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
        const newPost: Omit<PostType, "id" | "blogName"> = {
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
        const newPost: Omit<PostType, "id" | "blogName"> = {
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
        const newBlog: Omit<BlogType, "id"> = {
            name: "test name",
            description: "test description",
            websiteUrl: "https://mytestsite.com"
        }

        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)

        expect(blogRes.body).toEqual(
            {
                ...newBlog,
                id: expect.any(String)
            }
        );

        const newPost: Omit<PostType, "id" | "blogName"> = {
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
                blogName: newBlog.name
            }
        );
    })
})


describe("update post by id /posts", () => {
    beforeAll(() => {
        postsRepository.clearDB();
    })

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.POSTS}/7777`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for invalid title and no shortDescription", async () => {
        const blog: Omit<BlogType, "id"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com"
        };
        const blogId = blogsRepository.addNewBlog(blog);

        const post: Omit<PostType, "id" | "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: blogId,
        }
        const postId = postsRepository.addNewPost(post) as string;

        const updatedPost: Omit<PostType, "id" | "blogName" | "shortDescription"> = {
            title: "1234567890123456789012345678901",
            content: "content1",
            blogId: blogId,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.POSTS}/${postId}`)
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
        const blog1: Omit<BlogType, "id"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com"
        };
        const blog2: Omit<BlogType, "id"> = {
            name: "test name 2",
            description: "test description 2",
            websiteUrl: "https://mytestsite2.com"
        };

        const blog1Id = blogsRepository.addNewBlog(blog1);
        const blog2Id = blogsRepository.addNewBlog(blog2);

        const newPost: Omit<PostType, "id" | "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: blog1Id,
        }
        const postId = postsRepository.addNewPost(newPost);

        const updatedPost: Omit<PostType, "id" | "blogName"> = {
            title: "title2",
            shortDescription: "shortDescription2",
            content: "content2",
            blogId: blog2Id,
        }

        await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.POSTS}/${postId}`)
            .send(updatedPost)
            .expect(204)

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${postId}`)
            .expect(200)

        expect(res.body).toEqual({
            ...updatedPost,
            id: postId,
            blogName: blog2.name,
        });
    })
})

describe("delete post by id /posts", () => {
    beforeAll(() => {
        postsRepository.clearDB();
    })

    let postIdForDeletion: string = "";

    it("should return not empty array", async () => {
        const blog: Omit<BlogType, "id"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com"
        };
        const blogId = blogsRepository.addNewBlog(blog);

        const post: Omit<PostType, "id" | "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: blogId,
        }
        postIdForDeletion = postsRepository.addNewPost(post) as string;

        const checkRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(checkRes.body.length).toBe(1);
        expect(checkRes.body[0]).toEqual({
            ...post,
            id: postIdForDeletion,
            blogName: blog.name,
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
            .delete(`${SETTINGS.PATH.POSTS}/${postIdForDeletion}`)
            .expect(204)

        const checkRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(checkRes.body.length).toBe(0);
    })
})
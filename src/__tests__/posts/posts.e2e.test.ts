import { SETTINGS } from "../../settings";
import { createTestPosts } from "./helpers";
import { createTestBlogs } from "../blogs/helpers";
import { createTestComments } from "../comments/helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { PostViewType } from "../../repositories/postsRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/basicAuthMiddleware";
import { connectToTestDBAndClearRepositories, req, validAuthHeader, } from "../helpers";

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
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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

        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                    newestLikes: [],
                },
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

        const updatedPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "shortDescription" | "extendedLikesInfo"> = {
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

        const updatedPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "extendedLikesInfo"> = {
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
            createdAt: createdPost.createdAt,
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
                newestLikes: [],
            },
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

describe("create comment by post id /posts", () => {
    connectToTestDBAndClearRepositories();

    let createdUser: UserViewType;
    let userToken: string;
    let createdPost: PostViewType;

    beforeAll(async () => {
        createdUser = (await createTestUsers({}))[0];
        userToken = (await getUsersJwtTokens([createdUser]))[0];

        const createdBlog = (await createTestBlogs())[0];
        createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        req.set("Authorization", "");
    })


    it("should return 401 for request without auth header", async () => {
        const res = await req
            .post(`${SETTINGS.PATH.POSTS}/777777/comments`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for content is not string", async () => {
        const newComment: { content: null } = {
            content: null,
        }

        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .post(`${SETTINGS.PATH.POSTS}/777777/comments`)
            .send(newComment)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "content",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for content is too short", async () => {
        const newComment: { content: string } = {
            content: "qwerty",
        }

        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .post(`${SETTINGS.PATH.POSTS}/777777/comments`)
            .send(newComment)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "content",
                    message: "length must be: min 20, max 300"
                },
            ]
        );
    })

    it("should return 404 for non existent post", async () => {
        const newComment: { content: string } = {
            content: "12345678901234567890",
        }

        await req
            .set("Authorization", `Bearer ${userToken}`)
            .post(`${SETTINGS.PATH.POSTS}/777777/comments`)
            .send(newComment)
            .expect(404)
    })


    it("should create a comment", async () => {
        const newComment: { content: string } = {
            content: "12345678901234567890",
        }

        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .post(`${SETTINGS.PATH.POSTS}/${createdPost.id}/comments`)
            .send(newComment)
            .expect(201)

        expect(res.body).toEqual(
            {
                ...newComment,
                commentatorInfo: {
                    userId: createdUser?.id,
                    userLogin: createdUser?.login
                },
                id: expect.any(String),
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                },
            }
        );
    })
})

describe("get comments by postId /posts", () => {
    connectToTestDBAndClearRepositories();

    it("should return 404 if post does not exist", async () => {
        await req
            .get(`${SETTINGS.PATH.POSTS}/777777/comments`)
            .expect(404)
    })

    it("should get not empty array", async () => {
        const createdCommentsData = await createTestComments();

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${createdCommentsData.createdPostId}/comments`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items.length).toBe(1);

        expect(res.body.items).toEqual([
            createdCommentsData.comments[0],
        ])
    })
})

describe("update post likes /posts/:postId/like-status", () => {
    connectToTestDBAndClearRepositories();

    let user1: UserViewType;
    let user2: UserViewType;
    let user3: UserViewType;
    let user4: UserViewType;

    let user1Token: string;
    let user2Token: string;
    let user3Token: string;
    let user4Token: string;

    let createdPost: PostViewType;

    beforeAll(async () => {
        const createdUsers = await createTestUsers({count: 4});
        user1 = createdUsers[0];
        user2 = createdUsers[1];
        user3 = createdUsers[2];
        user4 = createdUsers[3];

        const usersTokens = await getUsersJwtTokens(createdUsers);
        user1Token = usersTokens[0];
        user2Token = usersTokens[1];
        user3Token = usersTokens[2];
        user4Token = usersTokens[3];

        const createdBlog = (await createTestBlogs())[0];
        createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        req.set("Authorization", "");
    })

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.POSTS}/7777/like-status`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for likeStatus is not string", async () => {
        const res = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/7777/like-status`)
            .send({ likeStatus: null })
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "likeStatus",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for likeStatus is not equal to Like, Dislike, None statuses", async () => {
        const res = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/7777/like-status`)
            .send({ likeStatus: "some" })
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "likeStatus",
                    message: "status must None, Like, or Dislike"
                },
            ]
        );
    })

    it("should return 404 for non existent post", async () => {
        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/7777/like-status`)
            .send({ likeStatus: "None" })
            .expect(404)
    })

    it("should increase Likes count", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res0.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
        });

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res1.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                }
            ],
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res2.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                }
            ],
        });
    })

    it("should keep Likes count", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res0.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                }
            ],
        });

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)

        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res1.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                }
            ],
        });
    })

    it("should reduce Likes count, removed newestLikes, and increase Dislikes count", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res0.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                }
            ],
        });

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Dislike" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res1.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "None",
            newestLikes: [],
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res2.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "Dislike",
            newestLikes: [],
        });
    })

    it("should reduce Dislikes count and set None status", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res0.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "None",
            newestLikes: [],
        });

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "None" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res1.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res2.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
        });
    })

    it("should get last 3 likes", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res0.body.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
        });

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)
        await req
            .set("Authorization", `Bearer ${user2Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)
        await req
            .set("Authorization", `Bearer ${user3Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)
        await req
            .set("Authorization", `Bearer ${user4Token}`)
            .put(`${SETTINGS.PATH.POSTS}/${createdPost.id}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res1.body.extendedLikesInfo).toEqual({
            likesCount: 4,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user4.id,
                    login: user4.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user3.id,
                    login: user3.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user2.id,
                    login: user2.login,
                },
            ],
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .get(`${SETTINGS.PATH.POSTS}/${createdPost.id}`)
            .expect(200)
        expect(res2.body.extendedLikesInfo).toEqual({
            likesCount: 4,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user4.id,
                    login: user4.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user3.id,
                    login: user3.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user2.id,
                    login: user2.login,
                },
            ],
        });
    })
})
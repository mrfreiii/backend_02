import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories
} from "../utils/testHelpers";
import { SETTINGS } from "../settings";
import { BlogQueryType } from "../controllers/blogsController/types";
import { BlogViewType } from "../repositories/blogsRepositories/types";
import { PostViewType } from "../repositories/postsRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../middlewares/authorizationMiddleware";
import { convertObjectToQueryString } from "../utils/convertObjectToQueryString";

describe("get all /blogs", () => {
    connectToTestDBAndClearRepositories();

    const newBlog1: Omit<BlogViewType, "id" | "createdAt"> = {
        name: "blog name 1",
        description: "apple phone",
        websiteUrl: "https://mynewblog2.con",
        isMembership: true,
    }
    const newBlog2: Omit<BlogViewType, "id" | "createdAt"> = {
        name: "blOG name 2",
        description: "apple juice",
        websiteUrl: "https://mynewblog1.con",
        isMembership: true,
    }
    let createdBlog1: BlogViewType | undefined;
    let createdBlog2: BlogViewType | undefined;

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.pagesCount).toBe(0);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items.length).toBe(0);
    })

    it("should get not empty array without query params", async () => {
        const blog1Res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog1)
            .expect(201)
        const blog2Res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog2)
            .expect(201)

        createdBlog1 = blog1Res.body;
        createdBlog2 = blog2Res.body;

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items[0]).toEqual({
            ...newBlog2,
            id: createdBlog2?.id,
            createdAt: expect.any(String),
        });
        expect(res.body.items[1]).toEqual({
            ...newBlog1,
            id: createdBlog1?.id,
            createdAt: expect.any(String),
        });
    })


    it("should get 2 blogs with searchName query", async () => {
        const query: Pick<BlogQueryType, "searchNameTerm"> = {
            searchNameTerm: "og"
        };
        const queryString = convertObjectToQueryString(query);

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}${queryString}`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items[0]).toEqual({
            ...newBlog2,
            id: createdBlog2?.id,
            createdAt: expect.any(String),
        });
        expect(res.body.items[1]).toEqual({
            ...newBlog1,
            id: createdBlog1?.id,
            createdAt: expect.any(String),
        });
    })

    it("should get 2 blogs with sortDirection asc", async () => {
        const query: Pick<BlogQueryType, "sortDirection"> = {
            sortDirection: "asc"
        };
        const queryString = convertObjectToQueryString(query);

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}${queryString}`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items[0]).toEqual({
            ...newBlog1,
            id: createdBlog1?.id,
            createdAt: expect.any(String),
        });
        expect(res.body.items[1]).toEqual({
            ...newBlog2,
            id: createdBlog2?.id,
            createdAt: expect.any(String),
        });
    })

    it("should get 2 blogs with sortBy name", async () => {
        const query: Pick<BlogQueryType, "sortBy"> = {
            sortBy: "name"
        };
        const queryString = convertObjectToQueryString(query);

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}${queryString}`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items[0]).toEqual({
            ...newBlog1,
            id: createdBlog1?.id,
            createdAt: expect.any(String),
        });
        expect(res.body.items[1]).toEqual({
            ...newBlog2,
            id: createdBlog2?.id,
            createdAt: expect.any(String),
        });
    })

    it("should get 2 blogs with page number and page size", async () => {
        const query: Pick<BlogQueryType, "pageNumber" | "pageSize"> = {
            pageNumber: 2,
            pageSize: 1,
        };
        const queryString = convertObjectToQueryString(query);

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}${queryString}`)
            .expect(200)

        expect(res.body.pagesCount).toBe(2);
        expect(res.body.page).toBe(2);
        expect(res.body.pageSize).toBe(1);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(1);

        expect(res.body.items[0]).toEqual({
            ...newBlog1,
            id: createdBlog1?.id,
            createdAt: expect.any(String),
        });
    })
})

describe("get blog by id /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true,
        }
        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)
        const createdBlog = blogRes.body;


        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog?.id}`)
            .expect(200)

        expect(res.body).toEqual({
            ...newBlog,
            id: createdBlog?.id,
            createdAt: expect.any(String),
        });
    })
})

describe("get posts by blogId /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should return error if blog does not exist", async () => {
        await req
            .get(`${SETTINGS.PATH.BLOGS}/123777/posts`)
            .expect(404)
    })

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true,
        }
        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)
        const createdBlog = blogRes.body;

        const newPost1: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogId: createdBlog?.id,
        }
        const newPost2: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: "title2",
            shortDescription: "shortDescription2",
            content: "content2",
            blogId: createdBlog?.id,
        }

        const post1Res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost1)
            .expect(201)
        const post2Res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(newPost2)
            .expect(201)

        const createdPost1 = post1Res.body;
        const createdPost2 = post2Res.body;

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog?.id}/posts`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items).toEqual(
            [
                {
                    ...newPost2,
                    id: createdPost2?.id,
                    blogName: newBlog.name,
                    createdAt: expect.any(String)
                },
                {
                    ...newPost1,
                    id: createdPost1?.id,
                    blogName: newBlog.name,
                    createdAt: expect.any(String)
                },
            ])
    })
})

describe("create blog /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 401 for auth header with invalid auth type", async () => {
        const res = await req
            .set("Authorization", "Bearer 1234567890")
            .post(SETTINGS.PATH.BLOGS)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.InvalidHeader);
    })

    it("should return 401 for auth header with invalid auth type", async () => {
        const invalidUserCreds = "login:password";
        const encodedCreds = Buffer.from(invalidUserCreds, "utf8").toString("base64");

        const res = await req
            .set("Authorization", `Basic ${encodedCreds}`)
            .post(SETTINGS.PATH.BLOGS)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.InvalidLoginOrPassword);
    })

    it("should return 400 for name, description, and websiteUrl are not string", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt" | "isMembership"> = {
            name: null as unknown as string,
            description: null as unknown as string,
            websiteUrl: null as unknown as string
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(3);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "name",
                    message: "value must be a string"
                },
                {
                    field: "description",
                    message: "value must be a string"
                },
                {
                    field: "websiteUrl",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for name, description, websiteUrl and too short", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt" | "isMembership"> = {
            name: " ",
            description: " ",
            websiteUrl: " "
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(3);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "name",
                    message: "length must be: min 1, max 15"
                },
                {
                    field: "description",
                    message: "length must be: min 1, max 500"
                },
                {
                    field: "websiteUrl",
                    message: "length must be: min 1, max 100"
                },
            ]
        );
    })

    it("should return 400 for name too long", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt" | "isMembership"> = {
            name: "1234567890123456",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages[0]).toEqual(
            {
                field: "name",
                message: "length must be: min 1, max 15"
            }
        );
    })

    it("should return 400 for invalid websiteUrl", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt" | "isMembership"> = {
            name: "test name",
            description: "test description",
            websiteUrl: "invalid websiteUrl"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages[0]).toEqual(
            {
                field: "websiteUrl",
                message: "value must be url address"
            }
        );
    })

    it("should create a blog", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "test name",
            description: "test description",
            websiteUrl: "https://mytestsite.com",
            isMembership: true,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)

        expect(res.body).toEqual(
            {
                ...newBlog,
                id: expect.any(String),
                createdAt: expect.any(String)
            }
        );
    })
})

describe("create post by blogId /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should return 404 for non existent blog", async () => {
        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogId"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
            blogName: "blogName"
        }

        await req
            .set("Authorization", validAuthHeader)
            .post(`${SETTINGS.PATH.BLOGS}/123777/posts`)
            .send(newPost)
            .expect(404)
    })

    it("should create a post", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true,
        }
        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)
        const createdBlog = blogRes.body;

        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName" | "blogId"> = {
            title: "title1",
            shortDescription: "shortDescription1",
            content: "content1",
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(`${SETTINGS.PATH.BLOGS}/${createdBlog?.id}/posts`)
            .send(newPost)
            .expect(201)

        expect(res.body).toEqual(
            {
                ...newPost,
                id: expect.any(String),
                blogId: createdBlog?.id,
                blogName: newBlog.name,
                createdAt: expect.any(String)
            }
        );
    })
})

describe("update blog /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.BLOGS}/777777`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 404 for non existent blog", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: true
        }

        await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.BLOGS}/777777`)
            .send(newBlog)
            .expect(404)
    })

    it("should update a blog", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: true
        }

        const createRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)

        expect(createRes.body).toEqual(
            {
                ...newBlog,
                id: expect.any(String),
                createdAt: expect.any(String)
            }
        );

        const updatedBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "test name 2",
            description: "test description 2",
            websiteUrl: "https://mytestsite2.com",
            isMembership: false
        }

        await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.BLOGS}/${createRes.body.id}`)
            .send(updatedBlog)
            .expect(204)

        const checkRes = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createRes.body.id}`)
            .expect(200)

        expect(checkRes.body).toEqual({
            ...updatedBlog,
            id: createRes.body.id,
            createdAt: checkRes.body.createdAt
        });
    })
})

describe("delete blog by id /blogs", () => {
    connectToTestDBAndClearRepositories();

    let blogForDeletion: BlogViewType;

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .delete(`${SETTINGS.PATH.BLOGS}/777777`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: true
        };
        const blogRes = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(201)
        blogForDeletion = blogRes.body;

        const checkRes = await req
            .get(`${SETTINGS.PATH.BLOGS}/${blogForDeletion?.id}`)
            .expect(200)

        expect(checkRes.body).toEqual({
            ...newBlog,
            id: blogForDeletion?.id,
            createdAt: blogForDeletion.createdAt,
        });
    })

    it("should return 404 for non existent blog", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.BLOGS}/77777`)
            .expect(404)
    })

    it("should delete blog and get empty array", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.BLOGS}/${blogForDeletion?.id}`)
            .expect(204)

        const checkRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(checkRes.body.pagesCount).toBe(0);
        expect(checkRes.body.page).toBe(1);
        expect(checkRes.body.pageSize).toBe(10);
        expect(checkRes.body.totalCount).toBe(0);
        expect(checkRes.body.items.length).toBe(0);
    })
})
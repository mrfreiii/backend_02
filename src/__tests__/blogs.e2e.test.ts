import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories
} from "./test-helpers";
import { SETTINGS } from "../settings";
import { BlogType } from "../db/types";
import { AUTH_ERROR_MESSAGES } from "../middlewares/authorizationMiddleware";
import { blogsRepository } from "../blogs/blogsRepository";

describe("get all /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toBe(0);
    })

    it("should get not empty array", async () => {
        const newBlog: BlogType = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true,
        }
        const createdBlogId = await blogsRepository.addNewBlog(newBlog)

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toBe(1);
        expect(res.body[0]).toEqual({
            ...newBlog,
            id: createdBlogId,
            createdAt: expect.any(String),
        });
    })
})

describe("get blog by id /blogs", () => {
    connectToTestDBAndClearRepositories();

    it("should get not empty array", async () => {
        const newBlog: BlogType = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
            isMembership: true,
        }
        const createdBlogId = await blogsRepository.addNewBlog(newBlog);

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlogId}`)
            .expect(200)

        expect(res.body).toEqual({
            ...newBlog,
            id: createdBlogId,
            createdAt: expect.any(String),
        });
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
        const newBlog: Omit<BlogType, "isMembership"> = {
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
        const newBlog: Omit<BlogType, "isMembership"> = {
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
        const newBlog: Omit<BlogType, "isMembership"> = {
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
        const newBlog: Omit<BlogType, "isMembership"> = {
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
        const newBlog: BlogType = {
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
        const newBlog: BlogType = {
            name: "test name",
            description: "test description",
            websiteUrl: "https://mytestsite.com",
            isMembership: true
        }

        await req
            .set("Authorization", validAuthHeader)
            .put(`${SETTINGS.PATH.BLOGS}/777777`)
            .send(newBlog)
            .expect(404)
    })

    it("should update a blog", async () => {
        const newBlog: BlogType = {
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

        const updatedBlog: BlogType = {
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

    let blogIdForDeletion: string = "";

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .delete(`${SETTINGS.PATH.BLOGS}/777777`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should get not empty array", async () => {
        const blog: BlogType = {
            name: "test name 1",
            description: "test description 1",
            websiteUrl: "https://mytestsite1.com",
            isMembership: true
        };
        blogIdForDeletion = await blogsRepository.addNewBlog(blog);

        const checkRes = await req
            .get(`${SETTINGS.PATH.BLOGS}/${blogIdForDeletion}`)
            .expect(200)

        expect(checkRes.body).toEqual({
            ...blog,
            id: blogIdForDeletion,
            createdAt: expect.any(String)
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
            .delete(`${SETTINGS.PATH.BLOGS}/${blogIdForDeletion}`)
            .expect(204)

        const checkRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(checkRes.body.length).toBe(0);
    })
})
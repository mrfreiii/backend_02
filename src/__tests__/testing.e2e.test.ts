import { SETTINGS } from "../settings";
import {
    connectToTestDBAndClearRepositories,
    req,
    validAuthHeader
} from "../utils/testHelpers";
import { BlogViewType } from "../repositories/blogsRepositories/types";
import { PostViewType } from "../repositories/postsRepositories/types";

describe("delete all data", () => {
    connectToTestDBAndClearRepositories();

    it("should get default post and blog", async () => {
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

        expect(blogRes.body).toEqual({
            ...newBlog,
            id: blogRes?.body?.id,
            createdAt: expect.any(String)
        });

        const newPost: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
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

    it("should delete all data", async () => {
        await req
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(204)

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(blogsRes.body.items.length).toBe(0);

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.items.length).toBe(0);
    })
})
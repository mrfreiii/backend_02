import { SETTINGS } from "../../settings";
import {
    connectToTestDBAndClearRepositories,
    req,
} from "../helpers";
import { createTestBlogs } from "../blogs/helpers";
import { createTestPosts } from "../posts/helpers";

describe("delete all data", () => {
    connectToTestDBAndClearRepositories();

    it("should get default post and blog", async () => {
        const createdBlog = (await createTestBlogs())[0];
        const createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)
        expect(blogsRes.body.items).toEqual([
            createdBlog,
        ])

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)
        expect(postsRes.body.items[0]).toEqual({
            ...createdPost,
            blogName: createdBlog.name,
        });
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
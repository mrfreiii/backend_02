import { SETTINGS } from "../settings";
import { BlogType, PostType } from "../db/types";
import { connectToTestDBAndClearRepositories, req } from "./test-helpers";
import { blogsRepository } from "../blogs/blogsRepository";
import { postsRepository } from "../posts/postsRepository";

describe("delete all data", () => {
    connectToTestDBAndClearRepositories();

    it("should get default post and blog", async () => {
        const newBlog: Omit<BlogType, "isMembership"> = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
        }
        const createdBlogId = await blogsRepository.addNewBlog(newBlog);

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(blogsRes.body.length).toBe(1);
        expect(blogsRes.body[0]).toEqual({
            ...newBlog,
            id: createdBlogId,
            isMembership: false,
            createdAt: expect.any(String)
        });

        const newPost: Omit<PostType, "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlogId,
        }
        const createdPostId = await postsRepository.addNewPost(newPost)

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.length).toBe(1);
        expect(postsRes.body[0]).toEqual({
            ...newPost,
            id: createdPostId,
            blogName: newBlog.name,
            createdAt: expect.any(String)
        });
    })

    it("should delete all data", async () => {
        await req
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(204)

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(blogsRes.body.length).toBe(0);

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.length).toBe(0);
    })
})
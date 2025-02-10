import { SETTINGS } from "../settings";
import { BlogType } from "../blogs/types";
import { PostType } from "../posts/types";
import { blogsService } from "../blogs/blogsService";
import { postsService } from "../posts/postsService";
import { connectToTestDBAndClearRepositories, req } from "./test-helpers";

describe("delete all data", () => {
    connectToTestDBAndClearRepositories();

    it("should get default post and blog", async () => {
        const newBlog: Omit<BlogType, "isMembership"> = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con",
        }
        const createdBlog = await blogsService.addNewBlog(newBlog);

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(blogsRes.body.items.length).toBe(1);
        expect(blogsRes.body.items[0]).toEqual({
            ...newBlog,
            id: createdBlog?.id,
            isMembership: false,
            createdAt: expect.any(String)
        });

        const newPost: Omit<PostType, "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlog?.id as string,
        }
        const createdPost = await postsService.addNewPost(newPost)

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.items.length).toBe(1);
        expect(postsRes.body.items[0]).toEqual({
            ...newPost,
            id: createdPost?.id,
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

        expect(blogsRes.body.items.length).toBe(0);

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.items.length).toBe(0);
    })
})
import { SETTINGS } from "../settings";
import { BlogType, PostType } from "../db/types";
import { connectToTestDBAndClearRepositories, req } from "./test-helpers";
import { blogsRepositoryMongoDb } from "../repositories_mongo_db/blogsRepositoryMongoDb";
import { postsRepositoryMongoDb } from "../repositories_mongo_db/postsRepositoryMongoDb";

describe("delete all data", () => {
    connectToTestDBAndClearRepositories();

    it("should get default post and blog", async () => {
        const newBlog: BlogType = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con"
        }
        const createdBlogId = await blogsRepositoryMongoDb.addNewBlog(newBlog);

        const blogsRes = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(blogsRes.body.length).toBe(1);
        expect(blogsRes.body[0]).toEqual({
            ...newBlog,
            id: createdBlogId
        });

        const newPost: Omit<PostType, "blogName"> = {
            title: "test post title 1",
            shortDescription: "test post description 1",
            content: "test post content 1",
            blogId: createdBlogId,
        }
        const createdPostId = await postsRepositoryMongoDb.addNewPost(newPost)

        const postsRes = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(postsRes.body.length).toBe(1);
        expect(postsRes.body[0]).toEqual({
            ...newPost,
            id: createdPostId,
            blogName: newBlog.name,
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
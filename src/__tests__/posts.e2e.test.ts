import { req } from "./test-helpers";
import { SETTINGS } from "../settings";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";
import { postsRepository, PostType } from "../repositories/postsRepository";

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
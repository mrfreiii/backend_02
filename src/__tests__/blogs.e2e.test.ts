import { req } from "./test-helpers";
import { SETTINGS } from "../settings";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";

describe("get all /blogs", () => {
    beforeAll(() => {
        blogsRepository.clearDB();
    })

    it("should get empty array", async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toBe(0);
    })

    it("should get not empty array", async () => {
        const newBlog: Omit<BlogType, "id"> = {
            name: "new new new blog",
            description: "cannot create interesting description",
            websiteUrl: "https://mynewblog.con"
        }
        blogsRepository.addNewBlog(newBlog)

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toBe(1);
        expect(res.body[0]).toEqual({
            ...newBlog,
            id: expect.any(String)
        });
    })
})

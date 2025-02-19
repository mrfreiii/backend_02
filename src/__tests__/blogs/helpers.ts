import { SETTINGS } from "../../settings";
import { req, validAuthHeader } from "../helpers";
import { BlogViewType } from "../../repositories/blogsRepositories/types";

export const createTestBlogs = async (count: number = 1): Promise<BlogViewType[]> => {
    const result: BlogViewType[] = [];

    for(let i = 0; i < count; i++){
        const blog: Omit<BlogViewType, "id" | "createdAt"> = {
            name: `${i%2 ? "blog" : "BLOG"} name ${i+1}`,
            description: `description ${i+1}`,
            websiteUrl: `https://mynewblog${i+1}.con`,
            isMembership: !!(i%2),
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.BLOGS)
            .send(blog)
            .expect(201)

        result.push(res.body);
    }

    return result;
}

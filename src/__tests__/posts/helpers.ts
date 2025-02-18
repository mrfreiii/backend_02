import { SETTINGS } from "../../settings";
import { req, validAuthHeader } from "../../utils/testHelpers";
import { PostViewType } from "../../repositories/postsRepositories/types";

export const createTestPosts = async ({blogId, count = 1}:{blogId: string; count?: number}): Promise<PostViewType[]> => {
    const result: PostViewType[] = [];

    for(let i = 0; i < count; i++){
        const post: Omit<PostViewType, "id" | "createdAt" | "blogName"> = {
            title: `title ${i+1}`,
            shortDescription: `description ${i+1}`,
            content: `content ${i+1}`,
            blogId,
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.POSTS)
            .send(post)
            .expect(201)

        result.push(res.body);
    }

    return result;
}

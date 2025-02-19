import { req } from "../helpers";
import { SETTINGS } from "../../settings";
import { createTestPosts } from "../posts/helpers";
import { createTestBlogs } from "../blogs/helpers";
import { CommentViewType } from "../../repositories/commentsRepositories/types";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";


export const createTestComments = async (count: number = 1): Promise<{ comments: CommentViewType[], createdPostId: string }> => {
    const commentsList: CommentViewType[] = [];

    const createdUser = (await createTestUsers({}))[0];
    const userToken = (await getUsersJwtTokens([createdUser]))[0];

    const createdBlog = (await createTestBlogs())[0];
    const createdPost = (await createTestPosts({blogId: createdBlog.id}))[0];

    for (let i = 0; i < count; i++) {
        const comment: Omit<CommentViewType, "id" | "createdAt"> = {
            content: `comment content is ${i + 1}`,
            commentatorInfo: {
                userId: createdUser.id,
                userLogin: createdUser.login,
            },
        }

        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .post(`${SETTINGS.PATH.POSTS}/${createdPost.id}/comments`)
            .send(comment)
            .expect(201)

        commentsList.push(res.body);
    }

    return {
        comments: commentsList,
        createdPostId: createdPost.id
    }
}
import { SETTINGS } from "../../settings";
import { createTestComments } from "./helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { connectToTestDBAndClearRepositories, req, } from "../helpers";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/basicAuthMiddleware";

describe("get comment by id /comments/:id", () => {
    connectToTestDBAndClearRepositories();

    it("should return 404 for non existent comment", async () => {
        await req
            .get(`${SETTINGS.PATH.COMMENTS}/777777`)
            .expect(404)
    })

    it("should get not empty array", async () => {
        const createdComment = (await createTestComments()).comments[0];

        const res = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${createdComment.id}`)
            .expect(200)
        expect(res.body).toEqual(createdComment);
    })
})

describe("update comment by id /comments/:id", () => {
    connectToTestDBAndClearRepositories();

    let user1Token: string;
    let user2Token: string;
    let commentId: string;

    beforeAll(async ()=>{
        const createdCommentData = await createTestComments();
        user1Token = createdCommentData.userToken;
        commentId = createdCommentData.comments[0].id;

        const createdUser2 = (await createTestUsers({}))[0];
        user2Token = (await getUsersJwtTokens([createdUser2]))[0];
    })

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.COMMENTS}/777777`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for content is not string", async () => {
        const updatedComment: {content: null} = {
            content: null,
        }

        const res = await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .send(updatedComment)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "content",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 404 for non existent comment", async () => {
        const updatedComment: {content: string} = {
            content: "12345678901234567890qwerty",
        }

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.COMMENTS}/777777`)
            .send(updatedComment)
            .expect(404)
    })

    it("should return 403 for comment of another user", async () => {
        const updatedComment: {content: string} = {
            content: "12345678901234567890qwerty",
        }

        await req
            .set("Authorization", `Bearer ${user2Token}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .send(updatedComment)
            .expect(403)
    })

    it("should update comment", async () => {
        const updatedComment: {content: string} = {
            content: "12345678901234567890qwerty",
        }

        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .send(updatedComment)
            .expect(204)
    })
})

describe("delete comment by id /comments/:id", () => {
    connectToTestDBAndClearRepositories();

    let user1Token: string;
    let user2Token: string;
    let commentId: string;

    beforeAll(async ()=>{
        const createdCommentData = await createTestComments();
        user1Token = createdCommentData.userToken;
        commentId = createdCommentData.comments[0].id;

        const createdUser2 = (await createTestUsers({}))[0];
        user2Token = (await getUsersJwtTokens([createdUser2]))[0];
    })

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/777777`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 404 for non existent comment", async () => {
        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .delete(`${SETTINGS.PATH.COMMENTS}/777777`)
            .expect(404)
    })

    it("should return 403 for comment of another user", async () => {
        await req
            .set("Authorization", `Bearer ${user2Token}`)
            .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(403)
    })

    it("should delete comment", async () => {
        await req
            .set("Authorization", `Bearer ${user1Token}`)
            .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(204)

         await req
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(404)
    })
})

describe("update comment like status /comments/:id/like-status", () => {
    connectToTestDBAndClearRepositories();

    let userToken: string;
    let commentId: string;

    beforeAll(async ()=>{
        const createdCommentData = await createTestComments();
        userToken = createdCommentData.userToken;
        commentId = createdCommentData.comments[0].id;
    })

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .put(`${SETTINGS.PATH.COMMENTS}/777777/like-status`)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for likeStatus is not string", async () => {
        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/777777/like-status`)
            .send({ likeStatus: null })
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "likeStatus",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for likeStatus is not equal to Like, Dislike, None statuses", async () => {
        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/777777/like-status`)
            .send({ likeStatus: "some" })
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "likeStatus",
                    message: "status must None, Like, or Dislike"
                },
            ]
        );
    })

    it("should return 404 for non existent comment", async () => {
        await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/777777/like-status`)
            .send({ likeStatus: "None" })
            .expect(404)
    })

    it("should increase Like count", async () => {
        //Checking initial status
        const res0 = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res0.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
        });

        await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res1.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res2.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
        });
    })

    it("should keep Like count", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res0.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
        });

        await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
            .send({ likeStatus: "Like" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res1.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res2.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
        });
    })

    it("should reduce Like count and increase Dislike count", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res0.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
        });

        await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
            .send({ likeStatus: "Dislike" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res1.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "None",
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res2.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "Dislike",
        });
    })

    it("should reduce Dislike count and set None status", async () => {
        //Checking initial status
        const res0 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res0.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "Dislike",
        });

        await req
            .set("Authorization", `Bearer ${userToken}`)
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
            .send({ likeStatus: "None" })
            .expect(204)

        // Checking status for non-authenticated user
        const res1 = await req
            .set("Authorization", "")
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res1.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
        });

        // Checking status for authenticated user
        const res2 = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        expect(res2.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
        });
    })
})
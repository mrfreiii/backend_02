import { SETTINGS } from "../../settings";
import { createTestComments } from "./helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { connectToTestDBAndClearRepositories, req, } from "../helpers";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/basicAuthMiddleware";

describe("get comment by id /comments", () => {
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

describe("update comment by id /comments", () => {
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

describe("delete comment by id /comments", () => {
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
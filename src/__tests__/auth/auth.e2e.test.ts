import {
    req,
    connectToTestDBAndClearRepositories
} from "../helpers";
import { SETTINGS } from "../../settings";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/jwtAuthMiddleware";

describe("login user /login", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;

    it("should return 400 for loginOrEmail and password are not string", async () => {
        const authData: {loginOrEmail: null, password: null} = {
            loginOrEmail: null,
            password: null,
        }

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "loginOrEmail",
                    message: "value must be a string"
                },
                {
                    field: "password",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should login user by login", async () => {
        createdUser = (await createTestUsers({password: userPassword}))[0];

        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: createdUser.login,
            password: userPassword,
        }

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(200)
        expect(res.body).toEqual({accessToken: expect.any(String)})
    })

    it("should login user by email", async () => {
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: createdUser.email,
            password: userPassword,
        }

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(200)
        expect(res.body).toEqual({accessToken: expect.any(String)})
    })

    it("should return 401 for invalid password", async () => {
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: createdUser.email,
            password: "invalid password",
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(401)
    })

    it("should return 401 for non existent user", async () => {
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: "noExist",
            password: userPassword,
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(401)
    })
})

describe("check user /me", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .get(`${SETTINGS.PATH.AUTH}/me`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 401 for invalid auth header", async () => {
        const res = await req
            .set("Authorization", "Basic 1234567890")
            .get(`${SETTINGS.PATH.AUTH}/me`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.InvalidHeader);
    })

    it("should return 401 for invalid jwt token", async () => {
        const res = await req
            .set("Authorization", "Bearer 1234567890")
            .get(`${SETTINGS.PATH.AUTH}/me`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.InvalidJwtToken);
    })

    it("should return user info", async () => {
        const createdUser = (await createTestUsers({}))[0];
        const userToken = (await getUsersJwtTokens([createdUser]))[0];

        const res = await req
            .set("Authorization", `Bearer ${userToken}`)
            .get(`${SETTINGS.PATH.AUTH}/me`)
            .expect(200)

        expect(res.body).toEqual({
            email: createdUser.email,
            login: createdUser.login,
            userId: createdUser.id,
        });
    })
})
import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories
} from "../utils/testHelpers";
import { SETTINGS } from "../settings";
import { UserViewType } from "../repositories/usersRepositories/types";

describe("login user /login", () => {
    connectToTestDBAndClearRepositories();

    const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
        login: "userLogin",
        password: "userPassword",
        email: "user@email.com"
    }

    it("should create a user", async () => {
        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(201)

        expect(res.body).toEqual(
            {
                login: newUser.login,
                email: newUser.email,
                id: expect.any(String),
                createdAt: expect.any(String)
            }
        );
    })

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
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: newUser.login,
            password: newUser.password,
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(204)
    })

    it("should login user by email", async () => {
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: newUser.email,
            password: newUser.password,
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(204)
    })

    it("should return 401 for invalid password", async () => {
        const authData: {loginOrEmail: string, password: string} = {
            loginOrEmail: newUser.email,
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
            password: "invalid password",
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(401)
    })
})

import {
    req,
    validAuthHeader,
    connectToTestDBAndClearRepositories
} from "../../utils/testHelpers";
import { SETTINGS } from "../../settings";
import { createTestUsers } from "./helpers";
import { UserQueryType } from "../../controllers/usersController/types";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/basicAuthMiddleware";
import { convertObjectToQueryString } from "../../utils/convertObjectToQueryString";

describe("create user /users", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .post(SETTINGS.PATH.USERS)
            .send({})
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should return 400 for login, password, and email are not string", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: null as unknown as string,
            password: null as unknown as string,
            email: null as unknown as string
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(3);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "login",
                    message: "value must be a string"
                },
                {
                    field: "password",
                    message: "value must be a string"
                },
                {
                    field: "email",
                    message: "value must be a string"
                },
            ]
        );
    })

    it("should return 400 for login and password too short", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "a",
            password: "a",
            email: "test@test.com"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "login",
                    message: "length must be: min 3, max 10"
                },
                {
                    field: "password",
                    message: "length must be: min 6, max 20"
                },
            ]
        );
    })

    it("should return 400 for login and password too long", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "12345678901",
            password: "123456789012345678901",
            email: "test@test.com"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "login",
                    message: "length must be: min 3, max 10"
                },
                {
                    field: "password",
                    message: "length must be: min 6, max 20"
                },
            ]
        );
    })

    it("should return 400 for invalid login and email", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "логин",
            password: "password",
            email: "qwerty"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(2);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "login",
                    message: "allowed symbols: a-z, A-Z, 0-9, _-"
                },
                {
                    field: "email",
                    message: "value must be email"
                },
            ]
        );
    })

    it("should create a user", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "userLogin",
            password: "userPassword",
            email: "user@email.com"
        }

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

    it("should return 400 for creating user with same login", async () => {
        const newUser1: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "user1Login",
            password: "user1Password",
            email: "user1@email.com"
        }
        await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser1)
            .expect(201)

        const newUser2: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: newUser1.login,
            password: "user2Password",
            email: "user2@email.com"
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser2)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "login",
                    message: "login should be unique"
                },
            ]
        );
    })

    it("should return 400 for creating user with same email", async () => {
        const newUser1: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "user111",
            password: "user111",
            email: "user111@email.com"
        }
        await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser1)
            .expect(201)

        const newUser2: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
            login: "user222",
            password: "user222",
            email: newUser1.email
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(newUser2)
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "email",
                    message: "email should be unique"
                },
            ]
        );
    })
})

describe("get all /users", () => {
    connectToTestDBAndClearRepositories();

    let createdUsers: UserViewType[] = []

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .get(SETTINGS.PATH.USERS)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should get empty array", async () => {
        const res = await req
            .set("Authorization", validAuthHeader)
            .get(SETTINGS.PATH.USERS)
            .expect(200)

        expect(res.body.pagesCount).toBe(0);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items.length).toBe(0);
    })

    it("should get not empty array without query params", async () => {
        createdUsers = await createTestUsers({count: 2});

        const res = await req
            .set("Authorization", validAuthHeader)
            .get(SETTINGS.PATH.USERS)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);

        expect(res.body.items).toEqual([
            createdUsers[1],
            createdUsers[0],
        ])
    })


    it("should get 1 user with searchName query", async () => {
        const query: Pick<UserQueryType, "searchLoginTerm"> = {
            searchLoginTerm: "in1"
        };
        const queryString = convertObjectToQueryString(query);

        const res = await req
            .set("Authorization", validAuthHeader)
            .get(`${SETTINGS.PATH.USERS}${queryString}`)
            .expect(200)

        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items.length).toBe(1);

        expect(res.body.items[0]).toEqual(createdUsers[0]);
    })
})

describe("delete user by id /users", () => {
    connectToTestDBAndClearRepositories();

    let userForDeletion: UserViewType;

    it("should return 401 for request without auth header", async () => {
        const res = await req
            .delete(`${SETTINGS.PATH.USERS}/777777`)
            .expect(401)

        expect(res.body.error).toBe(AUTH_ERROR_MESSAGES.NoHeader);
    })

    it("should get not empty array", async () => {
        userForDeletion = (await createTestUsers({}))[0];

        const checkRes = await req
            .set("Authorization", validAuthHeader)
            .get(SETTINGS.PATH.USERS)
            .expect(200)

        expect(checkRes.body.items[0]).toEqual(userForDeletion);
    })

    it("should return 404 for non existent user", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.USERS}/77777`)
            .expect(404)
    })

    it("should delete user and get empty array", async () => {
        await req
            .set("Authorization", validAuthHeader)
            .delete(`${SETTINGS.PATH.USERS}/${userForDeletion?.id}`)
            .expect(204)

        const checkRes = await req
            .get(SETTINGS.PATH.USERS)
            .expect(200)

        expect(checkRes.body.pagesCount).toBe(0);
        expect(checkRes.body.page).toBe(1);
        expect(checkRes.body.pageSize).toBe(10);
        expect(checkRes.body.totalCount).toBe(0);
        expect(checkRes.body.items.length).toBe(0);
    })
})
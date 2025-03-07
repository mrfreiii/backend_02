import {
    req,
    connectToTestDBAndClearRepositories,
    RealDate, mockDate
} from "../helpers";
import { SETTINGS } from "../../settings";
import { registerTestUser } from "./helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/jwtAuthMiddleware";
import { nodemailerService } from "../../services/nodemailerService/nodemailerService";

let confirmationCodeCount = 0;
const validRegistrationConfirmationCode = "123456789";
jest.mock("uuid", () => ({
    v4: () => {
        const code = validRegistrationConfirmationCode + confirmationCodeCount;
        if (confirmationCodeCount === 0) {
            confirmationCodeCount++
        }

        return code;
    }
}));

describe("login user /login", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;

    it("should return 400 for loginOrEmail and password are not string", async () => {
        const authData: { loginOrEmail: null, password: null } = {
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

        const authData: { loginOrEmail: string, password: string } = {
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
        const authData: { loginOrEmail: string, password: string } = {
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
        const authData: { loginOrEmail: string, password: string } = {
            loginOrEmail: createdUser.email,
            password: "invalid password",
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(401)
    })

    it("should return 401 for non existent user", async () => {
        const authData: { loginOrEmail: string, password: string } = {
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

describe("register user /registration", () => {
    connectToTestDBAndClearRepositories();

    it("should return 400 for login, password, and email are not string", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & { password: string } = {
            login: null as unknown as string,
            password: null as unknown as string,
            email: null as unknown as string
        }

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
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

    it("should register a user", async () => {
        const newUser: Omit<UserViewType, "id" | "createdAt"> & { password: string } = {
            login: "userLogin",
            password: "userPassword",
            email: "user@email.com"
        }

        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser)
            .expect(204)

        expect(nodemailerService.sendEmailWithConfirmationCode).toBeCalled();
        expect(nodemailerService.sendEmailWithConfirmationCode).toBeCalledTimes(1);
    })
})

describe("confirm user registration /registration-confirmation", () => {
    connectToTestDBAndClearRepositories();

    beforeAll(async () => {
        await registerTestUser();
    })

    afterEach(() => {
        global.Date = RealDate;
    })

    it("should return 400 for invalid confirmation code", async () => {
        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "12345"})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "code",
                    message: "invalid confirmation code"
                },
            ]
        );
    })

    it("should return 400 for code expiration", async () => {
        mockDate("2098-11-25T12:34:56z")

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: validRegistrationConfirmationCode + 1})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "code",
                    message: "code expired"
                },
            ]
        );
    })

    it("should return 204 for correct confirmation code", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: validRegistrationConfirmationCode + 1})
            .expect(204)
    })
})

describe("resend registration email /registration-email-resending", () => {
    connectToTestDBAndClearRepositories();

    const user1Email = "user1@email.com";
    const user2Email = "user2@email.com";

    beforeAll(async () => {
        await registerTestUser([user1Email, user2Email]);
    })

    it("should return 400 for invalid email format", async () => {
        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "email",
                    message: "value must be email"
                },
            ]
        );
    })

    it("should return 400 for unregistered email", async () => {
        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty@test.com"})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "email",
                    message: "user not found"
                },
            ]
        );
    })

    it("should return 400 for already confirmed email", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: validRegistrationConfirmationCode + 1})
            .expect(204)

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user1Email})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1);
        expect(res.body.errorsMessages).toEqual([
                {
                    field: "email",
                    message: "user already confirmed"
                },
            ]
        );
    })

    it("should resend email", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
    })
})

describe("refresh token /refresh-token", () => {
    connectToTestDBAndClearRepositories();

    it("should return 401 for no refresh token in cookie", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
            .expect(401)
    })

    it("should return 401 for invalid refresh token", async () => {
        await req
            .set("Cookie", ["refreshToken=12345667"])
            .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
            .expect(401)
    })
})
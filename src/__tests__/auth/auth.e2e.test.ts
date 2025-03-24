import { add } from "date-fns";

import {
    req,
    connectToTestDBAndClearRepositories,
    RealDate,
    mockDate,
} from "../helpers";
import { SETTINGS } from "../../settings";
import { registerTestUser } from "./helpers";
import { createTestUsers, getUsersJwtTokens } from "../users/helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { AUTH_ERROR_MESSAGES } from "../../middlewares/jwtAuthMiddleware";
import { nodemailerService } from "../../services/nodemailerService/nodemailerService";
import { rateLimitRepository } from "../../repositories/rateLimitsRepositories";

let validRegistrationConfirmationCode = "12345";
jest.mock("uuid", () => ({
    v4: () => {
        return validRegistrationConfirmationCode;
    }
}));

describe("login user /login", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;

    beforeAll(async () => {
        createdUser = (await createTestUsers({password: userPassword}))[0];
    })

    afterEach(() => {
        global.Date = RealDate;
    })

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

    it("should return 429 for 6th request during 10 seconds (rate limit) and 401 after waiting", async () => {
        await rateLimitRepository.clearDB();

        const nonExistentUser: { loginOrEmail: string, password: string } = {
            loginOrEmail: "noExist",
            password: userPassword,
        }

        // attempt #1
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(401)

        // attempt #2
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(401)

        // attempt #3
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(401)

        // attempt #4
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(401)

        // attempt #5
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(401)

        // attempt #6
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
            .expect(429)

        const dateInFuture = add(new Date(),{
            seconds: 10,
        })
        mockDate(dateInFuture.toISOString())

        // attempt #7
        await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(nonExistentUser)
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

    beforeEach(async () => {
        await rateLimitRepository.clearDB();
    })

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

    it("should return 429 for 6th attempt during 10 seconds", async () => {
        const newUser1: { login: string; email: string; password: string } = {
            login: "user1Login",
            password: "user1Password",
            email: "user1@email.com"
        }
        const newUser2: { login: string; email: string; password: string } = {
            login: "user2Login",
            password: "user2Password",
            email: "user2@email.com"
        }
        const newUser3: { login: string; email: string; password: string } = {
            login: "user3Login",
            password: "user3Password",
            email: "user3@email.com"
        }
        const newUser4: { login: string; email: string; password: string } = {
            login: "user4Login",
            password: "user4Password",
            email: "user4@email.com"
        }
        const newUser5: { login: string; email: string; password: string } = {
            login: "user5Login",
            password: "user5Password",
            email: "user5@email.com"
        }
        const newUser6: { login: string; email: string; password: string } = {
            login: "user6Login",
            password: "user6Password",
            email: "user6@email.com"
        }

        // attempt #1
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser1)
            .expect(204)
        // attempt #2
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser2)
            .expect(204)
        // attempt #3
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser3)
            .expect(204)
        // attempt #4
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser4)
            .expect(204)
        // attempt #5
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser5)
            .expect(204)
        // attempt #6
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration`)
            .send(newUser6)
            .expect(429)
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
            .send({code: "00000"})
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
            .send({code: validRegistrationConfirmationCode})
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
            .send({code: validRegistrationConfirmationCode})
            .expect(204)
    })

    it("should return 429 for 6th attempt and 400 after waiting 10sec", async () => {
        await rateLimitRepository.clearDB();

        // attempt #1
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)

        // attempt #2
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)

        // attempt #3
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)

        // attempt #4
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)

        // attempt #5
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)

        // attempt #6
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(429)

        const dateInFuture = add(new Date(),{
            seconds: 10,
        })
        mockDate(dateInFuture.toISOString());

        // attempt #7 after waiting
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: "00000"})
            .expect(400)
    })
})

describe("resend registration email /registration-email-resending", () => {
    connectToTestDBAndClearRepositories();

    const user1Email = "user1@email.com";
    const user2Email = "user2@email.com";

    beforeAll(async () => {
        await registerTestUser([user1Email, user2Email]);
    })

    beforeEach(async () => {
        await rateLimitRepository.clearDB();
    })

    afterEach(() => {
        global.Date = RealDate;
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


    it("should return 429 for 6th request and 400 after waiting 10 sec", async () => {
        // attempt #1
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        // attempt #2
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        // attempt #3
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        // attempt #4
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        // attempt #5
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)

        // attempt #6
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(429)

        const dateInFuture = add(new Date(),{
            seconds: 10,
        })
        mockDate(dateInFuture.toISOString());

        // attempt #7
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: "qwerty"})
            .expect(400)
    })

    it("should return 400 for already confirmed email", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
            .send({code: validRegistrationConfirmationCode})
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

    it("should return 429 for 6th request during 10 seconds", async () => {
        // attempt #1
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
        // attempt #2
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
        // attempt #3
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
        // attempt #4
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
        // attempt #5
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(204)
        // attempt #6
        await req
            .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
            .send({email: user2Email})
            .expect(429)
    })
})

describe("refresh token /refresh-token", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;
    let authData: { loginOrEmail: string, password: string };
    let cookieWithRefreshToken: string;

    beforeAll(async () => {
        createdUser = (await createTestUsers({password: userPassword}))[0];

        authData = {
            loginOrEmail: createdUser.login,
            password: userPassword,
        }
    })

    afterEach(() => {
        global.Date = RealDate;
    })

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

    it("should update refresh token", async () => {
        const loginRes = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(200)
        cookieWithRefreshToken = loginRes.headers["set-cookie"];

        await req
            .set("cookie", loginRes.headers["set-cookie"])
            .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
            .expect(200)
    })

    it("should return 401 for outdated refresh token", async () => {
        const dateInFuture = add(new Date(),{
            seconds: 5,
        })
        mockDate(dateInFuture.toISOString());

        await req
            .set("cookie", cookieWithRefreshToken)
            .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
            .expect(401)
    })
})

describe("logout /logout", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;
    let authData: { loginOrEmail: string, password: string };
    let cookieWithValidRefreshToken: string;

    beforeAll(async () => {
        createdUser = (await createTestUsers({password: userPassword}))[0];

        authData = {
            loginOrEmail: createdUser.login,
            password: userPassword,
        }
    })

    it("should return 401 for no refresh token in cookie", async () => {
        await req
            .post(`${SETTINGS.PATH.AUTH}/logout`)
            .expect(401)
    })

    it("should return 401 for invalid refresh token", async () => {
        await req
            .set("cookie", ["refreshToken=12345667"])
            .post(`${SETTINGS.PATH.AUTH}/logout`)
            .expect(401)
    })

    it("should return 401 for outdated refresh token", async () => {
        const loginRes = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(200)
        const cookieWithOutdatedRefreshToken = loginRes.headers["set-cookie"];

        const refreshRes = await req
            .set("cookie", loginRes.headers["set-cookie"])
            .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
            .expect(200)
        cookieWithValidRefreshToken = refreshRes.headers["set-cookie"];

        await req
            .set("cookie", cookieWithOutdatedRefreshToken)
            .post(`${SETTINGS.PATH.AUTH}/logout`)
            .expect(401)
    })

    it("should logout user", async () => {
        await req
            .set("cookie", cookieWithValidRefreshToken)
            .post(`${SETTINGS.PATH.AUTH}/logout`)
            .expect(204)
    })
})
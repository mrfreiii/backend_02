import { SETTINGS } from "../../settings";
import { createTestUsers } from "../users/helpers";
import { getDeviceIdFromRefreshTokenCookie } from "./helpers";
import { connectToTestDBAndClearRepositories, req } from "../helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";

describe("get all sessions /devices", () => {
    connectToTestDBAndClearRepositories();

    const userPassword = "1234567890";
    let createdUser: UserViewType;

    it("should return 401 for request without refresh token", async () => {
        await req
            .get(`${SETTINGS.PATH.SECURITY}/devices`)
            .expect(401)
    })

    it("should get 4 sessions", async () => {
        createdUser = (await createTestUsers({password: userPassword}))[0];

        const authData: { loginOrEmail: string, password: string } = {
            loginOrEmail: createdUser.login,
            password: userPassword,
        }

        // session #1
        const res1 = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .set("User-Agent", "Mozilla/5.0 (Linux i651 ; en-US) AppleWebKit/602.33 (KHTML, like Gecko) Chrome/53.0.1935.131 Safari/533")
            .send(authData)
            .expect(200)

        // session #2
        const res2 = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .set("User-Agent", "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_9_6; en-US) Gecko/20130401 Firefox/58.2")
            .send(authData)
            .expect(200)

        // session #3
        const res3 = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .set("User-Agent", "Mozilla/5.0 (iPad; CPU iPad OS 11_1_3 like Mac OS X) AppleWebKit/536.14 (KHTML, like Gecko) Chrome/51.0.1700.324 Mobile Safari/602.0")
            .send(authData)
            .expect(200)

        // session #4
        const res4 = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .set("User-Agent", "Mozilla/5.0 (Windows; U; Windows NT 10.1; x64; en-US) AppleWebKit/534.34 (KHTML, like Gecko) Chrome/49.0.2605.271 Safari/602.5 Edge/9.21230")
            .send(authData)
            .expect(200)

        const deviceId1 = getDeviceIdFromRefreshTokenCookie(res1.headers["set-cookie"]);
        const deviceId2 = getDeviceIdFromRefreshTokenCookie(res2.headers["set-cookie"]);
        const deviceId3 = getDeviceIdFromRefreshTokenCookie(res3.headers["set-cookie"]);
        const deviceId4 = getDeviceIdFromRefreshTokenCookie(res4.headers["set-cookie"]);

        const cookie = res4.headers["set-cookie"];

        const sessions = await req
            .get(`${SETTINGS.PATH.SECURITY}/devices`)
            .set("cookie", cookie)
            .expect(200)

        expect(sessions.body).toEqual([
            {
                deviceId: deviceId1,
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: "Browser: Chrome 53.0.1935.131; OS: Linux i651",
            },
            {
                deviceId: deviceId2,
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: "Browser: Firefox 58.2; OS: macOS 10.9.6",
            },
            {
                deviceId: deviceId3,
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: "Browser: Mobile Chrome 51.0.1700.324; OS: iOS 11.1.3",
            },
            {
                deviceId: deviceId4,
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: "Browser: Edge 9.21230; OS: Windows NT 10.1",
            }
        ]);
    })
})

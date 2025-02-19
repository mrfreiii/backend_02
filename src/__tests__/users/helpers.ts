import { SETTINGS } from "../../settings";
import { req, validAuthHeader } from "../helpers";
import { UserViewType } from "../../repositories/usersRepositories/types";

const DEFAULT_USER_PASSWORD = "qwerty12345";

export const createTestUsers = async (
    {
        password,
        count = 1
    }: {
        password?: string;
        count?: number
    }): Promise<UserViewType[]> => {
    const result: UserViewType[] = [];

    for (let i = 0; i < count; i++) {
        const uniqueId = Number(Date.now()).toString().substring(8);

        const user: Omit<UserViewType, "id" | "createdAt"> & { password: string } = {
            login: `user${i+1}${uniqueId}`,
            password: password ?? DEFAULT_USER_PASSWORD,
            email: `email${uniqueId}@test.com`
        }

        const res = await req
            .set("Authorization", validAuthHeader)
            .post(SETTINGS.PATH.USERS)
            .send(user)
            .expect(201)

        result.push(res.body);
    }

    req.set("Authorization", "")
    return result;
}

export const getUsersJwtTokens = async (users: UserViewType[]): Promise<string[]> => {
    const result: string[] = [];

    for (let i = 0; i < users.length; i++) {
        const authData: { loginOrEmail: string, password: string } = {
            loginOrEmail: users[i].login,
            password: DEFAULT_USER_PASSWORD,
        }

        const res = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send(authData)
            .expect(200)

        result.push(res.body.accessToken);
    }

    return result;
}

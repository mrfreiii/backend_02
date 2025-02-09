import { app } from "../app";
import { agent } from "supertest";
import { SETTINGS } from "../settings";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToTestDB } from "../db/mongodb";
import { postsRepository } from "../posts/postsRepository";
import { blogsRepository } from "../blogs/blogsRepository";

export const req = agent(app);

const userCredentials = `${SETTINGS.CREDENTIALS.LOGIN}:${SETTINGS.CREDENTIALS.PASSWORD}`;
const encodedUserCredentials = Buffer.from(userCredentials, "utf8").toString("base64");
export const validAuthHeader = `Basic ${encodedUserCredentials}`;

// можно создать такую функцию и вызывать ее вначале describe
export const connectToTestDBAndClearRepositories = () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await connectToTestDB();

        await postsRepository.clearDB();
        await blogsRepository.clearDB();
        req.set("Authorization", "");
    })

    afterAll(async () => {
        await server.stop();
    })
}
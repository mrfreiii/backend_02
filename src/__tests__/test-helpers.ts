import { app } from "../app";
import { agent } from "supertest";
import { SETTINGS } from "../settings";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToTestDB } from "../db/mongodb";
import { postsRepositoryMongoDb } from "../repositories_mongo_db/postsRepositoryMongoDb";
import { blogsRepositoryMongoDb } from "../repositories_mongo_db/blogsRepositoryMongoDb";

export const req = agent(app);

const userCredentials = `${SETTINGS.CREDENTIALS.LOGIN}:${SETTINGS.CREDENTIALS.PASSWORD}`;
const encodedUserCredentials = Buffer.from(userCredentials, "utf8").toString("base64");
export const validAuthHeader = `Basic ${encodedUserCredentials}`;

// можно создать такую функцию и вызывать ее вначале describe
export const connectToTestDBAndClearRepositories = () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await connectToTestDB();

        await postsRepositoryMongoDb.clearDB();
        await blogsRepositoryMongoDb.clearDB();
        req.set("Authorization", "");
    })

    afterAll(async () => {
        await server.stop();
    })
}
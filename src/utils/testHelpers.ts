import { agent } from "supertest";

import { app } from "../app";
import { SETTINGS } from "../settings";
import { connectToTestDB } from "../db/mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { postsRepository } from "../repositories/postsRepositories/postsRepository";
import { blogsRepository } from "../repositories/blogsRepositories/blogsRepository";
import { usersRepository } from "../repositories/usersRepositories/usersRepository";

export const req = agent(app);

const userCredentials = `${SETTINGS.CREDENTIALS.LOGIN}:${SETTINGS.CREDENTIALS.PASSWORD}`;
const encodedUserCredentials = Buffer.from(userCredentials, "utf8").toString("base64");
export const validAuthHeader = `Basic ${encodedUserCredentials}`;

export const connectToTestDBAndClearRepositories = () => {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await connectToTestDB();

        await postsRepository.clearDB();
        await blogsRepository.clearDB();
        await usersRepository.clearDB();
        req.set("Authorization", "");
    })

    afterAll(async () => {
        await server.stop();
    })
}
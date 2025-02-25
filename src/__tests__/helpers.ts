import { agent } from "supertest";

import { app } from "../app";
import { SETTINGS } from "../settings";
import { connectToTestDB } from "../db/mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { postsRepository } from "../repositories/postsRepositories";
import { blogsRepository } from "../repositories/blogsRepositories";
import { usersRepository } from "../repositories/usersRepositories";
import { commentsRepository } from "../repositories/commentsRepositories";
import { nodemailerService } from "../services/nodemailerService/nodemailerService";

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
        await commentsRepository.clearDB();
        req.set("Authorization", "");

        nodemailerService.sendEmailWithConfirmationCode = jest
            .fn()
            .mockImplementation(
                () => Promise.resolve()
            )
    })

    afterAll(async () => {
        await server.stop();
    })
}

export const RealDate = Date;
export const mockDate = (isoDate: string) => {
    // @ts-ignore
    global.Date = class extends RealDate {
        constructor () {
            super();
            return new RealDate(isoDate)
        }
    }
}
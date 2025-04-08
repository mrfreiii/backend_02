import mongoose from "mongoose";
import { agent } from "supertest";

import { app } from "../app";
import { SETTINGS } from "../settings";
import { ioc } from "../composition-root";
import { connectToTestDB } from "../db/db";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PostsRepository } from "../repositories/postsRepositories";
import { BlogsRepository } from "../repositories/blogsRepositories";
import { UsersRepository } from "../repositories/usersRepositories";
import { CommentsRepository } from "../repositories/commentsRepositories";
import { SessionsRepository } from "../repositories/sessionsRepositories";
import { RateLimitRepository } from "../repositories/rateLimitsRepositories";
import { NodemailerService } from "../services/nodemailerService/nodemailerService";

export const req = agent(app);

const userCredentials = `${SETTINGS.CREDENTIALS.LOGIN}:${SETTINGS.CREDENTIALS.PASSWORD}`;
const encodedUserCredentials = Buffer.from(userCredentials, "utf8").toString("base64");
export const validAuthHeader = `Basic ${encodedUserCredentials}`;

export const nodemailerTestService = new NodemailerService();

export const connectToTestDBAndClearRepositories = () => {
    let server: MongoMemoryServer;
    let mongooseConnection: typeof mongoose;

    beforeAll(async () => {
        const connections = await connectToTestDB();
        server = connections?.server;
        mongooseConnection = connections?.mongooseConnection;

        await ioc.get(BlogsRepository).clearDB();
        await ioc.get(PostsRepository).clearDB();
        await ioc.get(UsersRepository).clearDB();
        await ioc.get(SessionsRepository).clearDB();
        await ioc.get(CommentsRepository).clearDB();
        await ioc.get(RateLimitRepository).clearDB();
        req.set("Authorization", "");

        nodemailerTestService.sendEmailWithConfirmationCode = jest
            .fn()
            .mockImplementation(() => Promise.resolve());

        nodemailerTestService.sendEmailWithPasswordRecoveryCode = jest
            .fn()
            .mockImplementation(() => Promise.resolve());
    })

    afterAll(async () => {
        await server.stop();
        await mongooseConnection.connection.close()
    })
}

export const RealDate = Date;
export const mockDate = (isoDate: string) => {
    class MockDate extends RealDate {
        constructor() {
            super();
            return new RealDate(isoDate)
        }

        static now() {
            return new RealDate(isoDate).getTime();
        }
    }

    // @ts-ignore
    global.Date = MockDate;
}

export const delayInSec = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({})
        }, delay * 1000)
    })
}
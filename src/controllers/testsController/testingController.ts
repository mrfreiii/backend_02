import { Router, Request, Response } from "express";

import { blogsRepository } from "../../repositories/blogsRepositories";
import { postsRepository } from "../../repositories/postsRepositories";
import { usersRepository } from "../../repositories/usersRepositories";
import { sessionsRepository } from "../../repositories/sessionsRepositories";
import { commentsRepository } from "../../repositories/commentsRepositories";
import { rateLimitRepository } from "../../repositories/rateLimitsRepositories";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        try {
            const isBlogsDeleted = await blogsRepository.clearDB();
            const isPostsDeleted = await postsRepository.clearDB();
            const isUsersDeleted = await usersRepository.clearDB();
            const isCommentsDeleted = await commentsRepository.clearDB();
            const isRateLimitDeleted = await rateLimitRepository.clearDB();
            const isSessionsDeleted = await sessionsRepository.clearDB();


            if (!isBlogsDeleted || !isPostsDeleted || !isUsersDeleted || !isCommentsDeleted || !isRateLimitDeleted || !isSessionsDeleted) {
                res.sendStatus(599)
                return;
            }

            res.sendStatus(204)
        } catch (e) {
            console.log(e);
            res.sendStatus(599);
        }
    },
}

testingRouter
    .route("/all-data")
    .delete(testingController.deleteAllData);
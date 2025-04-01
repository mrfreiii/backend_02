import { injectable } from "inversify";
import { Request, Response } from "express";

import { BlogsRepository } from "../../repositories/blogsRepositories";
import { PostsRepository } from "../../repositories/postsRepositories";
import { UsersRepository } from "../../repositories/usersRepositories";
import { CommentsRepository } from "../../repositories/commentsRepositories";
import { SessionsRepository } from "../../repositories/sessionsRepositories";
import { RateLimitRepository } from "../../repositories/rateLimitsRepositories";

@injectable()
export class TestingController {
    async deleteAllData(req: Request, res: Response) {
        try {
            const isBlogsDeleted = await BlogsRepository.clearDB();
            const isPostsDeleted = await PostsRepository.clearDB();
            const isUsersDeleted = await UsersRepository.clearDB();
            const isSessionsDeleted = await SessionsRepository.clearDB();
            const isCommentsDeleted = await CommentsRepository.clearDB();
            const isRateLimitDeleted = await RateLimitRepository.clearDB();


            if (!isBlogsDeleted || !isPostsDeleted || !isUsersDeleted || !isCommentsDeleted || !isRateLimitDeleted || !isSessionsDeleted) {
                res.sendStatus(599)
                return;
            }

            res.sendStatus(204)
        } catch (e) {
            console.log(e);
            res.sendStatus(599);
        }
    }
}

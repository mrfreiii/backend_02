import { injectable } from "inversify";
import { Request, Response } from "express";

import { ioc } from "../../composition-root";
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
            const isBlogsDeleted = await ioc.get(BlogsRepository).clearDB();
            const isPostsDeleted = await ioc.get(PostsRepository).clearDB();
            const isUsersDeleted = await ioc.get(UsersRepository).clearDB();
            const isSessionsDeleted = await ioc.get(SessionsRepository).clearDB();
            const isCommentsDeleted = await ioc.get(CommentsRepository).clearDB();
            const isRateLimitDeleted = await ioc.get(RateLimitRepository).clearDB();

            if (
                !isBlogsDeleted ||
                !isPostsDeleted ||
                !isUsersDeleted ||
                !isSessionsDeleted ||
                !isCommentsDeleted ||
                !isRateLimitDeleted
            ) {
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

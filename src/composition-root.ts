import "reflect-metadata";
import {Container} from "inversify";

import { JwtService } from "./services/jwtService/jwtService";
import { AuthService } from "./services/authService/authService";
import { UsersService } from "./services/usersService/usersService";
import { BlogsService } from "./services/blogsService/blogsService";
import { PostsService } from "./services/postsService/postsService";
import { BcryptService } from "./services/bcryptService/bcryptService";
import { CommentsService } from "./services/commentsService/commentsService";
import { SessionsService } from "./services/sessionsService/sessionsService";
import { NodemailerService } from "./services/nodemailerService/nodemailerService";

import { AuthController } from "./routers/authRouter/authController";
import { UsersController } from "./routers/usersRouter/usersController";
import { BlogsController } from "./routers/blogsRouter/blogsController";
import { PostsController } from "./routers/postsRouter/postsController";
import { TestingController } from "./routers/testsRouter/testingController";
import { CommentsController } from "./routers/commentsRouter/commentsController";
import { SecurityController } from "./routers/securityRouter/securityController";

import {
    CommentsQueryRepository,
    CommentsRepository
} from "./repositories/commentsRepositories";
import {
    SessionQueryRepository,
    SessionsRepository
} from "./repositories/sessionsRepositories";
import { RateLimitRepository } from "./repositories/rateLimitsRepositories";
import { PostsQueryRepository, PostsRepository } from "./repositories/postsRepositories";
import { UsersQueryRepository, UsersRepository } from "./repositories/usersRepositories";
import { BlogsQueryRepository, BlogsRepository } from "./repositories/blogsRepositories";

export const ioc = new Container();

// Repositories
ioc.bind(UsersRepository).toSelf();
ioc.bind(UsersQueryRepository).toSelf();
ioc.bind(BlogsRepository).toSelf();
ioc.bind(BlogsQueryRepository).toSelf();
ioc.bind(PostsRepository).toSelf();
ioc.bind(PostsQueryRepository).toSelf();
ioc.bind(CommentsRepository).toSelf();
ioc.bind(CommentsQueryRepository).toSelf();
ioc.bind(SessionsRepository).toSelf();
ioc.bind(SessionQueryRepository).toSelf();
ioc.bind(RateLimitRepository).toSelf();

// Services
ioc.bind(UsersService).toSelf();
ioc.bind(AuthService).toSelf();
ioc.bind(BcryptService).toSelf();
ioc.bind(NodemailerService).toSelf();
ioc.bind(BlogsService).toSelf();
ioc.bind(PostsService).toSelf();
ioc.bind(CommentsService).toSelf();
ioc.bind(SessionsService).toSelf();
ioc.bind(JwtService).toSelf();

// Controllers
ioc.bind(UsersController).toSelf();
ioc.bind(AuthController).toSelf();
ioc.bind(BlogsController).toSelf();
ioc.bind(PostsController).toSelf();
ioc.bind(CommentsController).toSelf();
ioc.bind(SecurityController).toSelf();
ioc.bind(TestingController).toSelf();
import "reflect-metadata";
import {Container} from "inversify";

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
import { PostsQueryRepository, PostsRepository } from "./repositories/postsRepositories";
import { UsersQueryRepository, UsersRepository } from "./repositories/usersRepositories";
import { BlogsQueryRepository, BlogsRepository } from "./repositories/blogsRepositories";

export const compositionRootContainer = new Container();

// Repositories
compositionRootContainer.bind(UsersRepository).toSelf();
compositionRootContainer.bind(UsersQueryRepository).toSelf();
compositionRootContainer.bind(BlogsRepository).toSelf();
compositionRootContainer.bind(BlogsQueryRepository).toSelf();
compositionRootContainer.bind(PostsRepository).toSelf();
compositionRootContainer.bind(PostsQueryRepository).toSelf();
compositionRootContainer.bind(CommentsRepository).toSelf();
compositionRootContainer.bind(CommentsQueryRepository).toSelf();
compositionRootContainer.bind(SessionsRepository).toSelf();
compositionRootContainer.bind(SessionQueryRepository).toSelf();

// Services
compositionRootContainer.bind(UsersService).toSelf();
compositionRootContainer.bind(AuthService).toSelf();
compositionRootContainer.bind(BcryptService).toSelf();
compositionRootContainer.bind(NodemailerService).toSelf();
compositionRootContainer.bind(BlogsService).toSelf();
compositionRootContainer.bind(PostsService).toSelf();
compositionRootContainer.bind(CommentsService).toSelf();
compositionRootContainer.bind(SessionsService).toSelf();

// Controllers
compositionRootContainer.bind(UsersController).toSelf();
compositionRootContainer.bind(AuthController).toSelf();
compositionRootContainer.bind(BlogsController).toSelf();
compositionRootContainer.bind(PostsController).toSelf();
compositionRootContainer.bind(CommentsController).toSelf();
compositionRootContainer.bind(SecurityController).toSelf();
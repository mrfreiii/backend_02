import "reflect-metadata";
import {Container} from "inversify";

import { AuthService } from "./services/authService/authService";
import { UsersService } from "./services/usersService/usersService";
import { BlogsService } from "./services/blogsService/blogsService";
import { BcryptService } from "./services/bcryptService/bcryptService";
import { NodemailerService } from "./services/nodemailerService/nodemailerService";

import { AuthController } from "./routers/authRouter/authController";
import { UsersController } from "./routers/usersRouter/usersController";
import { BlogsController } from "./routers/blogsRouter/blogsController";

import { UsersQueryRepository, UsersRepository } from "./repositories/usersRepositories";
import { BlogsQueryRepository, BlogsRepository } from "./repositories/blogsRepositories";

export const compositionRootContainer = new Container();

// Repositories
compositionRootContainer.bind(UsersRepository).toSelf();
compositionRootContainer.bind(UsersQueryRepository).toSelf();
compositionRootContainer.bind(BlogsRepository).toSelf();
compositionRootContainer.bind(BlogsQueryRepository).toSelf();

// Services
compositionRootContainer.bind(UsersService).toSelf();
compositionRootContainer.bind(AuthService).toSelf();
compositionRootContainer.bind(BcryptService).toSelf();
compositionRootContainer.bind(NodemailerService).toSelf();
compositionRootContainer.bind(BlogsService).toSelf();

// Controllers
compositionRootContainer.bind(UsersController).toSelf();
compositionRootContainer.bind(AuthController).toSelf();
compositionRootContainer.bind(BlogsController).toSelf();
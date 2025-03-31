import "reflect-metadata";
import {Container} from "inversify";

import { AuthService } from "./services/authService/authService";
import { UsersService } from "./services/usersService/usersService";
import { BcryptService } from "./services/bcryptService/bcryptService";
import { NodemailerService } from "./services/nodemailerService/nodemailerService";

import { AuthController } from "./routers/authRouter/authController";
import { UsersController } from "./routers/usersRouter/usersController";

import { UsersQueryRepository, UsersRepository } from "./repositories/usersRepositories";

export const compositionRootContainer = new Container();

// Repositories
compositionRootContainer.bind(UsersRepository).toSelf();
compositionRootContainer.bind(UsersQueryRepository).toSelf();

// Services
compositionRootContainer.bind(UsersService).toSelf();
compositionRootContainer.bind(AuthService).toSelf();
compositionRootContainer.bind(BcryptService).toSelf();
compositionRootContainer.bind(NodemailerService).toSelf();

// Controllers
compositionRootContainer.bind(UsersController).toSelf();
compositionRootContainer.bind(AuthController).toSelf();
import express from 'express';
import cors from 'cors';

import { SETTINGS } from "./settings";
import { authRouter } from "./controllers/authController/authController";
import { blogsRouter } from "./controllers/blogsController/blogsController";
import { postsRouter } from "./controllers/postsController/postsController";
import { usersRouter } from "./controllers/usersController/usersController";
import { testingRouter } from "./controllers/testsController/testingController";
import { commentsRouter } from "./controllers/commentsController/commentsController";

export const app = express();

app.use(express.json());
app.use(cors());

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);

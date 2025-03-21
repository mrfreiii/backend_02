import cors from 'cors';
import express from 'express';
import cookieParser from "cookie-parser";

import { SETTINGS } from "./settings";
import { authRouter } from "./controllers/authController/authController";
import { blogsRouter } from "./controllers/blogsController/blogsController";
import { postsRouter } from "./controllers/postsController/postsController";
import { usersRouter } from "./controllers/usersController/usersController";
import { testingRouter } from "./controllers/testsController/testingController";
import { commentsRouter } from "./controllers/commentsController/commentsController";
import { securityRouter } from "./controllers/securityController/securityController";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);
app.use(SETTINGS.PATH.SECURITY, securityRouter);

app.set('trust proxy', true);

app.use("/", (req, res)=>{
    res.json("server is available")
})
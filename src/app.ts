import cors from 'cors';
import express from 'express';
import cookieParser from "cookie-parser";

import { SETTINGS } from "./settings";
import { authRouter } from "./routers/authRouter/authController";
import { blogsRouter } from "./routers/blogsRouter/blogsController";
import { postsRouter } from "./routers/postsRouter/postsController";
import { usersRouter } from "./routers/usersRouter/usersController";
import { testingRouter } from "./routers/testsRouter/testingController";
import { commentsRouter } from "./routers/commentsRouter/commentsController";
import { securityRouter } from "./routers/securityRouter/securityController";

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
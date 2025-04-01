import cors from 'cors';
import express from 'express';
import cookieParser from "cookie-parser";

import { SETTINGS } from "./settings";
import { authRouter } from "./routers/authRouter/authRouter";
import { usersRouter } from "./routers/usersRouter/usersRouter";
import { blogsRouter } from "./routers/blogsRouter/blogsRouter";
import { postsRouter } from "./routers/postsRouter/postsRouter";
import { commentsRouter } from "./routers/commentsRouter/commentsRouter";
import { securityRouter } from "./routers/securityRouter/securityRouter";

import { testingRouter } from "./routers/testsRouter/testingController";

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
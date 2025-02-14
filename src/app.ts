import express from 'express';
import cors from 'cors';

import { SETTINGS } from "./settings";
import { blogsRouter } from "./controllers/blogsController/blogsController";
import { postsRouter } from "./controllers/postsController/postsController";
import { testingRouter } from "./controllers/testsController/testingController";

export const app = express();

app.use(express.json());
app.use(cors());

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);

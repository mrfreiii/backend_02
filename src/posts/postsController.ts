import { Request, Router, Response } from "express";
import { postsRepository, PostType } from "../repositories/postsRepository";
import { CreatePostReqType } from "./types";
import {
    blogIdValidator,
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "./postsValidators";
import { errorResultMiddleware } from "../middlewares/errorResultMiddleware";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";

export const postsRouter = Router();

const postsController = {
    getPosts: (req: Request, res: Response<PostType[]>) => {
        const allPosts = postsRepository.getAllPosts();

        res
            .status(200)
            .json(allPosts);
    },
    getPostById: (req: Request<{id: string}>, res: Response<PostType>) => {
        const foundPost = postsRepository.getPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundPost);
    },
    createPost: (req: CreatePostReqType, res: Response<PostType>) => {
        const createdPostId = postsRepository.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.body.blogId.trim(),
        });
        if (!createdPostId) {
            res.sendStatus(599);
            return;
        }

        const createdPost = postsRepository.getPostById(createdPostId);
        if (!createdPostId) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdPost);
    },
}

postsRouter.get("/", postsController.getPosts);
postsRouter.get("/:id", postsController.getPostById);
postsRouter.post("/",
    authorizationMiddleware,
    postTitleValidator,
    shortDescriptionValidator,
    contentValidator,
    blogIdValidator,
    errorResultMiddleware,
    postsController.createPost);
// videoRouter.put("/:id", videoController.updateVideo);
// videoRouter.delete("/:id", videoController.deleteVideoById);
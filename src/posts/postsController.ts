import { Request, Router, Response } from "express";

import {
    blogIdValidator,
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "./postsValidators";
import { CreatePostReqType, PostType, UpdatePostReqType } from "./types";
import { errorResultMiddleware } from "../middlewares/errorResultMiddleware";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";
import { postsRepository } from "./postsRepository";

export const postsRouter = Router();

const postsController = {
    getPosts: async (req: Request, res: Response<PostType[]>) => {
        // const allPosts = await postsRepository.getAllPosts();
        //
        // res
        //     .status(200)
        //     .json(allPosts);
    },
    getPostById: async (req: Request<{id: string}>, res: Response<PostType>) => {
        // const foundPost = await postsRepository.getPostById(req.params.id);
        //
        // if (!foundPost) {
        //     res.sendStatus(404);
        //     return;
        // }
        //
        // res
        //     .status(200)
        //     .json(foundPost);
    },
    createPost: async (req: CreatePostReqType, res: Response<PostType>) => {
        // const createdPostId = await postsRepository.addNewPost({
        //     title: req.body.title.trim(),
        //     shortDescription: req.body.shortDescription.trim(),
        //     content: req.body.content.trim(),
        //     blogId: req.body.blogId.trim(),
        // });
        // if (!createdPostId) {
        //     // validator must check blogId and if we here then something went wrong
        //     res.sendStatus(599);
        //     return;
        // }
        //
        // const createdPost = await postsRepository.getPostById(createdPostId);
        // if (!createdPostId) {
        //     res.sendStatus(599);
        //     return;
        // }
        //
        // res
        //     .status(201)
        //     .json(createdPost);
    },
    updatePost: async (req: UpdatePostReqType, res: Response) => {
        // const isUpdated = await postsRepository.updatePost({
        //     id: req.params.id,
        //     title: req.body.title,
        //     shortDescription: req.body.shortDescription,
        //     content: req.body.content,
        //     blogId: req.body.blogId,
        // });
        //
        // if (!isUpdated) {
        //     res.sendStatus(404);
        //     return;
        // }
        //
        // res.sendStatus(204);
    },
    deletePostById: async (req: Request<{id: string}>, res: Response<PostType>) => {
        // const isDeleted = await postsRepository.deletePostById(req.params.id);
        // if (!isDeleted) {
        //     res.sendStatus(404);
        //     return;
        // }
        //
        // res.sendStatus(204);
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
postsRouter.put("/:id",
    authorizationMiddleware,
    postTitleValidator,
    shortDescriptionValidator,
    contentValidator,
    blogIdValidator,
    errorResultMiddleware,
    postsController.updatePost);
postsRouter.delete("/:id",
    authorizationMiddleware,
    postsController.deletePostById);
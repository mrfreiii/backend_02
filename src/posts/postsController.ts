import { Request, Router, Response } from "express";
import { postsRepository, PostType } from "../repositories/postsRepository";

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
    }
}

postsRouter.get("/", postsController.getPosts);
postsRouter.get("/:id", postsController.getPostById);
// videoRouter.get("/:id", videoController.getVideoById);
// videoRouter.post("/", videoController.createVideo);
// videoRouter.put("/:id", videoController.updateVideo);
// videoRouter.delete("/:id", videoController.deleteVideoById);
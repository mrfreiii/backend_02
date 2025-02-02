import { Request, Router, Response } from "express";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";

export const blogsRouter = Router();

const blogsController = {
    getBlogs: (req: Request, res: Response<BlogType[]>) => {
        const allBlogs = blogsRepository.getAllBlogs();

        res
            .status(200)
            .json(allBlogs);
    },
    getBlogById: (req: Request<{id: string}>, res: Response<BlogType>) => {
        const foundBlog = blogsRepository.getBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundBlog);
    },
}

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlogById);
// videoRouter.get("/:id", videoController.getVideoById);
// videoRouter.post("/", videoController.createVideo);
// videoRouter.put("/:id", videoController.updateVideo);
// videoRouter.delete("/:id", videoController.deleteVideoById);
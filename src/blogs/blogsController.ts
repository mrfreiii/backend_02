import { Request, Router, Response } from "express";
import { blogsRepository, BlogType } from "../repositories/blogsRepository";
import { CreateBlogReqType, UpdateBlogReqType } from "./types";
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from "./blogsValidators";
import { errorResultMiddleware } from "../middlewares/errorResultMiddleware";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";

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
    createBlog: (req: CreateBlogReqType, res: Response<BlogType>) => {
        const createdBlogId = blogsRepository.addNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
        });
        const createdBlog = blogsRepository.getBlogById(createdBlogId);

        if (!createdBlog) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdBlog);
    },
    updateBlog: (req: UpdateBlogReqType, res: Response) => {
        const isUpdated = blogsRepository.updateBlog({
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
        });


        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204)
    },
    deleteBlogById: (req: Request<{id: string}>, res: Response) => {
        const isDeleted = blogsRepository.deleteBlogById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    },
}

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlogById);
blogsRouter.post("/",
    authorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorResultMiddleware,
    blogsController.createBlog);
blogsRouter.put("/:id",
    authorizationMiddleware,
    blogNameValidator,
    blogDescriptionValidator,
    blogWebsiteUrlValidator,
    errorResultMiddleware,
    blogsController.updateBlog);
blogsRouter.delete("/:id",
    authorizationMiddleware,
    blogsController.deleteBlogById);
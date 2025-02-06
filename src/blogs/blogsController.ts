import { Request, Router, Response } from "express";
import { CreateBlogReqType, UpdateBlogReqType } from "./types";
import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from "./blogsValidators";
import { errorResultMiddleware } from "../middlewares/errorResultMiddleware";
import { authorizationMiddleware } from "../middlewares/authorizationMiddleware";
import { BlogType } from "../db/types";
import { blogsRepositoryMongoDb } from "../repositories_mongo_db/blogsRepositoryMongoDb";

export const blogsRouter = Router();

const blogsController = {
    getBlogs: async (req: Request, res: Response<BlogType[]>) => {
        const allBlogs = await blogsRepositoryMongoDb.getAllBlogs();

        res
            .status(200)
            .json(allBlogs);
    },
    getBlogById: async (req: Request<{id: string}>, res: Response<BlogType>) => {
        const foundBlog = await blogsRepositoryMongoDb.getBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundBlog);
    },
    createBlog: async (req: CreateBlogReqType, res: Response<BlogType>) => {
        const createdBlogId = await blogsRepositoryMongoDb.addNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership,
        });
        const createdBlog = await blogsRepositoryMongoDb.getBlogById(createdBlogId);

        if (!createdBlog) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdBlog);
    },
    updateBlog: async (req: UpdateBlogReqType, res: Response) => {
        const isUpdated = await blogsRepositoryMongoDb.updateBlog({
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership
        });


        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204)
    },
    deleteBlogById: async (req: Request<{id: string}>, res: Response) => {
        const isDeleted = await blogsRepositoryMongoDb.deleteBlogById(req.params.id);
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
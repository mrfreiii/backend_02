import { Router } from "express";

import {
    blogDescriptionValidator,
    blogNameValidator,
    blogWebsiteUrlValidator
} from "./validators";
import {
    contentValidator,
    postTitleValidator,
    shortDescriptionValidator
} from "../postsRouter/validators";
import { ioc } from "../../composition-root";
import { BlogsController } from "./blogsController";
import { basicAuthMiddleware } from "../../middlewares/basicAuthMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const blogsRouter = Router();
const blogsController = ioc.get(BlogsController)

blogsRouter
    .route("/")
    .get(blogsController.getBlogs.bind(blogsController))
    .post(
        basicAuthMiddleware,
        blogNameValidator,
        blogDescriptionValidator,
        blogWebsiteUrlValidator,
        errorResultMiddleware,
        blogsController.createBlog.bind(blogsController));

blogsRouter
    .route("/:id")
    .get(blogsController.getBlogById.bind(blogsController))
    .put(
        basicAuthMiddleware,
        blogNameValidator,
        blogDescriptionValidator,
        blogWebsiteUrlValidator,
        errorResultMiddleware,
        blogsController.updateBlog.bind(blogsController))
    .delete(
        basicAuthMiddleware,
        blogsController.deleteBlogById.bind(blogsController));

blogsRouter
    .route("/:blogId/posts")
    .get(blogsController.getPostsByBlogId.bind(blogsController))
    .post(
        basicAuthMiddleware,
        postTitleValidator,
        shortDescriptionValidator,
        contentValidator,
        errorResultMiddleware,
        blogsController.createPostByBlogId.bind(blogsController));



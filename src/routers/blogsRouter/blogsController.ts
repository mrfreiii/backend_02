import { Response } from "express";
import { inject, injectable } from "inversify";

import {
    CreateBlogReqType,
    CreateBlogResType,
    CreatePostByBlogIdReqType,
    CreatePostByBlogIdResType,
    DeleteBlogReqType,
    GetAllBlogsReqType,
    GetAllBlogsResType,
    GetAllPostsByBlogIdReqType,
    GetAllPostsByBlogIdResType,
    GetBlogByIdReqType,
    GetBlogByIdResType,
    UpdateBlogReqType
} from "./types"
import { HttpStatuses } from "../types";
import { BlogsService } from "../../services/blogsService/blogsService";
import { PostsService } from "../../services/postsService/postsService";
import { parseBlogsQueryParams, parsePostsQueryParams } from "../../utils";
import { BlogsQueryRepository } from "../../repositories/blogsRepositories";
import { PostsQueryRepository } from "../../repositories/postsRepositories";

@injectable()
export class BlogsController {
    constructor(@inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
                @inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
                @inject(BlogsService) private blogsService: BlogsService,
                @inject(PostsService) private postsService: PostsService) {
    }

    async getBlogs(req: GetAllBlogsReqType, res: GetAllBlogsResType) {
        const parsedQuery = parseBlogsQueryParams(req.query);
        const allBlogs = await this.blogsQueryRepository.getAllBlogs(parsedQuery);

        res
            .status(200)
            .json(allBlogs);
    }

    async getBlogById(req: GetBlogByIdReqType, res: GetBlogByIdResType) {
        const foundBlog = await this.blogsQueryRepository.getBlogById(req.params.id);

        if (!foundBlog) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundBlog);
    }

    async getPostsByBlogId(req: GetAllPostsByBlogIdReqType, res: GetAllPostsByBlogIdResType) {
        const blog = await this.blogsQueryRepository.getBlogById(req.params.blogId);
        if (!blog) {
            res.sendStatus(HttpStatuses.NotFound_404);
            return;
        }

        const parsedQuery = parsePostsQueryParams(req.query);
        const allPosts = await this.postsQueryRepository.getAllPosts({
            userId: req.user?.id,
            parsedQuery,
            blogId: req.params.blogId
        });

        if (!allPosts) {
            res.sendStatus(HttpStatuses.ServerError_500);
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json(allPosts);
    }

    async createBlog(req: CreateBlogReqType, res: CreateBlogResType) {
        const createdBlogId = await this.blogsService.addNewBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            isMembership: req.body.isMembership,
        });
        const createdBlog = await this.blogsQueryRepository.getBlogById(createdBlogId);

        if (!createdBlog) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdBlog);
    }

    async createPostByBlogId(req: CreatePostByBlogIdReqType, res: CreatePostByBlogIdResType) {
        const createdPostId = await this.postsService.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.params.blogId,
        });
        if (!createdPostId) {
            res.sendStatus(404);
            return;
        }

        const createdPost = await this.postsQueryRepository.getPostById({
            userId: req.user?.id,
            postId: createdPostId
        });
        if (!createdPost) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdPost);
    }

    async updateBlog(req: UpdateBlogReqType, res: Response) {
        const isUpdated = await this.blogsService.updateBlog({
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
    }

    async deleteBlogById(req: DeleteBlogReqType, res: Response) {
        const isDeleted = await this.blogsService.deleteBlogById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    }
}

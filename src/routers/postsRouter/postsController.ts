import { Response } from "express";
import { inject, injectable } from "inversify";

import {
    AddCommentByPostIdReqType,
    AddCommentByPostIdResType,
    CreatePostReqType,
    CreatePostResType,
    DeletePostByIdReqType,
    GetAllPostsReqType,
    GetAllPostsResType,
    GetCommentsByPostIdReqType,
    GetCommentsByPostIdResType,
    GetPostByIdReqType,
    GetPostByIdResType,
    UpdatePostReqType
} from "./types";
import { HttpStatuses } from "../types";
import { ResultStatus } from "../../services/types";
import { resultCodeToHttpException } from "../helpers";
import { parseCommentsQueryParams, parsePostsQueryParams } from "../../utils";
import { PostsService } from "../../services/postsService/postsService";
import { CommentsService } from "../../services/commentsService/commentsService";
import { PostsQueryRepository } from "../../repositories/postsRepositories";
import { CommentsQueryRepository } from "../../repositories/commentsRepositories";

@injectable()
export class PostsController {
    constructor(@inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
                @inject(CommentsQueryRepository) private commentsQueryRepository: CommentsQueryRepository,
                @inject(PostsService) private postsService: PostsService,
                @inject(CommentsService) private commentsService: CommentsService) {
    }

    async getPosts(req: GetAllPostsReqType, res: GetAllPostsResType) {
        const parsedQuery = parsePostsQueryParams(req.query)
        const allPosts = await this.postsQueryRepository.getAllPosts({parsedQuery});

        res
            .status(200)
            .json(allPosts);
    }

    async getPostById(req: GetPostByIdReqType, res: GetPostByIdResType) {
        const foundPost = await this.postsQueryRepository.getPostById(req.params.id);

        if (!foundPost) {
            res.sendStatus(404);
            return;
        }

        res
            .status(200)
            .json(foundPost);
    }

    async createPost(req: CreatePostReqType, res: CreatePostResType) {
        const createdPostId = await this.postsService.addNewPost({
            title: req.body.title.trim(),
            shortDescription: req.body.shortDescription.trim(),
            content: req.body.content.trim(),
            blogId: req.body.blogId.trim(),
        });
        if (!createdPostId) {
            res.sendStatus(404);
            return;
        }

        const createdPost = await this.postsQueryRepository.getPostById(createdPostId);
        if (!createdPost) {
            res.sendStatus(599);
            return;
        }

        res
            .status(201)
            .json(createdPost);
    }

    async updatePost(req: UpdatePostReqType, res: Response) {
        const isUpdated = await this.postsService.updatePost({
            id: req.params.id,
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.body.blogId,
        });

        if (!isUpdated) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    }

    async deletePostById(req: DeletePostByIdReqType, res: Response) {
        const isDeleted = await this.postsService.deletePostById(req.params.id);
        if (!isDeleted) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    }

    async createCommentByPostId(req: AddCommentByPostIdReqType, res: AddCommentByPostIdResType) {
        const post = await this.postsQueryRepository.getPostById(req.params.postId);
        if (!post) {
            res.sendStatus(HttpStatuses.NotFound_404)
            return;
        }

        const result = await this.commentsService.addNewComment({
            content: req.body.content.trim(),
            commentatorInfo: {
                userId: req.user?.id!,
                userLogin: req.user?.login!,
            },
            postId: req.params.postId,
        });
        if (result.status !== ResultStatus.Success_200) {
            res.sendStatus(resultCodeToHttpException(result.status))
            return;
        }

        const createdComment = await this.commentsQueryRepository.getCommentById({
            commentId: result.data!,
            userId: req.user?.id
        });
        if (!createdComment) {
            res.sendStatus(HttpStatuses.ServerError_500);
            return;
        }

        res
            .status(HttpStatuses.Created_201)
            .json(createdComment);
    }

    async getCommentsByPostId(req: GetCommentsByPostIdReqType, res: GetCommentsByPostIdResType) {
        const post = await this.postsQueryRepository.getPostById(req.params.postId);
        if (!post) {
            res.sendStatus(HttpStatuses.NotFound_404);
            return;
        }

        const parsedQuery = parseCommentsQueryParams(req.query)
        const allComments = await this.commentsQueryRepository.getAllComments({
            parsedQuery,
            postId: req.params.postId,
            userId: req.user?.id
        });

        if (!allComments) {
            res.sendStatus(HttpStatuses.ServerError_500);
            return;
        }

        res
            .status(HttpStatuses.Success_200)
            .json(allComments);
    }
}

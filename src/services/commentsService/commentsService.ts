import {
    CommentDbType,
    CommentViewType
} from "../../repositories/commentsRepositories/types";
import { ResultStatus, ResultType } from "../types";
import {
    commentsRepository
} from "../../repositories/commentsRepositories/commentsRepository";
import {
    postsQueryRepository
} from "../../repositories/postsRepositories/postsQueryRepository";

export const commentsService = {
    addNewComment: async (
        dto: Omit<CommentViewType, "id" | "createdAt"> & { postId: string }
    ): Promise<ResultType<string | null>> => {
        const {content, commentatorInfo, postId} = dto;

        const post = await postsQueryRepository.getPostById(postId);
        if (!post) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: "пост не найден",
                extensions: [],
                data: null,
            }
        }

        const newComment: CommentDbType = {
            postId,
            content,
            commentatorInfo: {
                userId: commentatorInfo.userId,
                userLogin: commentatorInfo.userLogin
            },
            createdAt: (new Date()).toISOString(),
        };

        const createdCommentId = await commentsRepository.addNewComment(newComment);
        if (!createdCommentId) {
            return {
                status: ResultStatus.ServerError,
                errorMessage: "не удалось создать пост",
                extensions: [],
                data: null,
            }
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: createdCommentId,
        }
    }
    ,
//     updateBlog: async (dto: Omit<BlogViewType, "createdAt">): Promise<boolean> => {
//         const {id, name, description, websiteUrl, isMembership} = dto;
//
//         const updatedBlog: Omit<BlogViewType, "createdAt"> = {
//             id,
//             name: name.trim(),
//             description: description.trim(),
//             websiteUrl: websiteUrl.trim(),
//             isMembership: typeof isMembership === "boolean" ? isMembership : false,
//         }
//
//         return blogsRepository.updateBlog(updatedBlog);
//     },
//     deleteBlogById
// :
// async (id: string): Promise<boolean> => {
//     return blogsRepository.deleteBlogById(id);
// },
}
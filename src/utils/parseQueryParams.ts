import { AvailableSortDirections } from "../types";
import { BlogQueryType } from "../controllers/blogsController/types";
import { PostQueryType } from "../controllers/postsController/types";
import { UserQueryType } from "../controllers/usersController/types";
import { CommentQueryType } from "../controllers/commentsController/types";

export const parseUsersQueryParams = (queryParams: UserQueryType): UserQueryType => {
    const {
        sortBy,
        sortDirection,
        pageSize,
        pageNumber,
        searchLoginTerm,
        searchEmailTerm
    } = queryParams || {};
    const postsAvailableSortBy = ["id", "login", "email", "createdAt"]

    return {
        sortBy: postsAvailableSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirections.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
        searchLoginTerm: searchLoginTerm?.trim() ?? null,
        searchEmailTerm: searchEmailTerm?.trim() ?? null,
    }
}

export const parseBlogsQueryParams = (queryParams: BlogQueryType): BlogQueryType => {
    const {
        searchNameTerm,
        sortBy,
        sortDirection,
        pageSize,
        pageNumber
    } = queryParams || {};
    const blogsAvailableSortBy = ["id", "createdAt", "name", "description", "websiteUrl", "isMembership"];

    return {
        searchNameTerm: searchNameTerm?.trim() ?? null,
        sortBy: blogsAvailableSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirections.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}

export const parsePostsQueryParams = (queryParams: PostQueryType): PostQueryType => {
    const {sortBy, sortDirection, pageSize, pageNumber} = queryParams || {};
    const postsAvailableSortBy = ["id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt"]

    return {
        sortBy: postsAvailableSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirections.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}

export const parseCommentsQueryParams = (queryParams: CommentQueryType): CommentQueryType => {
    const {sortBy, sortDirection, pageSize, pageNumber} = queryParams || {};
    const commentsAvailableSortBy = ["id", "content", "commentatorInfo", "userId", "userLogin", "createdAt"]

    return {
        sortBy: commentsAvailableSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirections.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}
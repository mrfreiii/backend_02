import { AvailableSortDirection } from "../types";
import { BlogQueryType } from "../blogs/types";
import { PostQueryType } from "../posts/types";

export const parseBlogsQueryParams = (
    {
        queryParams,
        availableFieldSortBy
    }: {
        queryParams: BlogQueryType,
        availableFieldSortBy: string[]
    }): BlogQueryType => {
    const {
        searchNameTerm,
        sortBy,
        sortDirection,
        pageSize,
        pageNumber
    } = queryParams || {};

    return {
        searchNameTerm: searchNameTerm?.trim() ?? null,
        sortBy: availableFieldSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirection.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}

export const parsePostsQueryParams = (
    {
        queryParams,
        availableFieldSortBy
    }: {
        queryParams: PostQueryType,
        availableFieldSortBy: string[]
    }): PostQueryType => {
    const {sortBy, sortDirection, pageSize, pageNumber} = queryParams || {};

    return {
        sortBy: availableFieldSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirection.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}
import { AvailableSortDirection, QueryType } from "../types";

export const parseQueryParams = (
    {
        queryParams,
        availableFieldSortBy
    }: {
        queryParams: QueryType,
        availableFieldSortBy: string[]
    }): QueryType => {
    const {searchNameTerm, sortBy, sortDirection, pageSize, pageNumber} = queryParams || {};

    return {
        searchNameTerm: searchNameTerm?.trim() ?? null,
        sortBy: availableFieldSortBy.includes(sortBy as string) ? sortBy : "createdAt",
        sortDirection: AvailableSortDirection.includes(sortDirection as string) ? sortDirection : "desc",
        pageNumber: Number(pageNumber) && Number(pageNumber) > 0 ? Number(pageNumber) : 1,
        pageSize: Number(pageSize) && Number(pageSize) > 0 ? Number(pageSize) : 10,
    }
}
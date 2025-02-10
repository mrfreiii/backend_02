export const AvailableSortDirection = [1, -1, "asc", "desc", "ascending", "descending"];

export type WithPagination<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
}

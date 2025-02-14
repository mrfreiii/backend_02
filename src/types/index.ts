export const AvailableSortDirections = [1, -1, "asc", "desc", "ascending", "descending"];

export type WithPaginationType<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
}

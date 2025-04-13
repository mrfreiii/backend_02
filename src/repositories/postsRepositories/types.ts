import { LikeStatusEnum } from "../likesRepositories/types";

export type NewestLikesType = {
    addedAt: string;
    userId: string;
    login: string;
}

export type PostViewType = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatusEnum,
        newestLikes: NewestLikesType[],
    }
}

export type PostDbType = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        newestLikes: NewestLikesType[],
    }
}
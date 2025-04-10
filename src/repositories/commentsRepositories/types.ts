import { LikeStatusEnum } from "../likesRepositories/types";

export type CommentViewType = {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    }
    createdAt: string;
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatusEnum,
    }
}

export type CommentDbType = {
    postId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    likesCount: number;
    dislikesCount: number;
    createdAt: string;
}

export enum LikeStatusEnum {
    None = "None",
    Like = "Like",
    Dislike = "Dislike",
}

export type LikeDbType = {
    status: LikeStatusEnum;
    userId: string;
    userLogin: string;
    entityId: string; // commentId or postId
    addedAt: number;
}
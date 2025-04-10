export enum LikeStatusEnum {
    None = "None",
    Like = "Like",
    Dislike = "Dislike",
}

export type LikeDbType = {
    status: LikeStatusEnum;
    userId: string;
    entityId: string; // commentId or postId
}
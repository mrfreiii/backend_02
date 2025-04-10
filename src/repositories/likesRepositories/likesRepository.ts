import { injectable } from "inversify";
import { ObjectId, WithId } from "mongodb";

import { LikeDbType, LikeStatusEnum } from "./types";
import { LikeModel } from "../../models/likesModel/like.entity";

@injectable()
export class LikesRepository {
    async clearDB() {
        return LikeModel.collection.drop();
    }

    async getLikeByUserIdAndEntityId(
        {
            userId,
            entityId
        }: {
            userId: string;
            entityId: string
        }): Promise<WithId<LikeDbType> | null> {
        return LikeModel.findOne({
            userId,
            entityId
        });
    }

    async addLike(
        like: LikeDbType
    ): Promise<string> {
        try {
            const createdLike = await LikeModel.create(like);
            return createdLike?._id?.toString();
        } catch {
            return ""
        }
    }

    async updateLike(
        {likeId, newLikeStatus}: { likeId: ObjectId; newLikeStatus: LikeStatusEnum }
    ): Promise<boolean> {
            const result = await LikeModel.updateOne(
        {_id:likeId},
                {$set: {status: newLikeStatus}}
            );

            return result.matchedCount === 1;
    }

    async deleteLike(likeId: ObjectId): Promise<boolean> {
        const result = await LikeModel.deleteOne(
            {_id:likeId},
        );

        return result.deletedCount === 1;
    }
}
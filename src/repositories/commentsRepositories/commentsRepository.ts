import { CommentDbType } from "./types";
import { commentCollection } from "../../db/mongodb";

export const commentsRepository = {
    clearDB: async () => {
        return commentCollection.drop();
    },
    addNewComment: async (newComment: CommentDbType): Promise<string> => {
        try {
            const createdComment = await commentCollection.insertOne(newComment);
            return createdComment?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    // updateBlog: async (dto: Omit<BlogViewType, "createdAt">): Promise<boolean> => {
    //     const { id, ...updatedBlog } = dto;
    //
    //     try {
    //         const result = await blogCollection.updateOne(
    //             {_id: new ObjectId(id)},
    //             {$set: updatedBlog}
    //         );
    //
    //         return result.matchedCount === 1;
    //     } catch (e) {
    //         console.log(e);
    //         return false;
    //     }
    // },
    // deleteBlogById: async (id: string): Promise<boolean> => {
    //     try {
    //         const result = await blogCollection.deleteOne({_id: new ObjectId(id)});
    //         return result.deletedCount === 1;
    //     } catch (e) {
    //         console.log(e);
    //         return false;
    //     }
    // },
}
import { ObjectId, SortDirection } from "mongodb";

import { postCollection } from "../db/mongodb";
import { PostQueryType, PostType } from "./types";

export const postsRepository = {
    _clearDB: async () => {
        return postCollection.drop();
    },
    _getAllPosts: async (parsedQuery: PostQueryType) => {
        const {sortBy, sortDirection, pageSize, pageNumber} = parsedQuery;

        return postCollection
            .find({})
            .sort({[sortBy as string]: sortDirection as SortDirection})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },
    _getPostsCount: async () => {
        return postCollection.countDocuments({});
    },
    _getPostById: async (id: string) => {
        try {
            const result = await postCollection.findOne({_id: new ObjectId(id)});
            if (!result) {
                return;
            }

            return result;
        } catch (e) {
            console.log(e);
            return;
        }
    },
    _addNewPost: async (
        newPost: PostType
    ): Promise<string> => {
        try {
            const createdPost = await postCollection.insertOne(newPost);
            return createdPost?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    _updatePost: async (
        {
            id,
            updatedPost,
        }: {
            id: string;
            updatedPost: PostType;
        }
    ): Promise<boolean> => {
        try {
            const result = await postCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedPost}
            );

            return result.matchedCount === 1;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    _deletePostById: async (id: string): Promise<boolean> => {
        try{
            const result = await postCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (e){
            console.log(e);
            return false;
        }
    },
}
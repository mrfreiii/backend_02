import { InsertOneResult } from "mongodb";

import { RateLimitDbType } from "./types";
import { rateLimitCollection } from "../../db/mongodb";

export const rateLimitRepository = {
    clearDB: async () => {
        return rateLimitCollection.drop();
    },
    addNewRequest: async (
        newRequest: RateLimitDbType
    ): Promise<InsertOneResult<RateLimitDbType>> => {
        return rateLimitCollection.insertOne(newRequest);
    },
    getRequestCount: async (parametersForSearch: RateLimitDbType): Promise<number> => {
        const filter = {
            url: parametersForSearch.url,
            ip: parametersForSearch.ip,
            date: { $gte: parametersForSearch.date }
        }

        return rateLimitCollection.countDocuments(filter);
    },
}
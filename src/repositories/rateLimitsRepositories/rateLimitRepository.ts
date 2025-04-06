import { InsertOneResult } from "mongodb";

import { RateLimitDbType } from "./types";
import { rateLimitCollection } from "../../db/mongodb";

export class RateLimitRepository {
    static async clearDB()  {
        return rateLimitCollection.drop();
    }

    static async addNewRequest(
        newRequest: RateLimitDbType
    ): Promise<InsertOneResult<RateLimitDbType>> {
        return rateLimitCollection.insertOne(newRequest);
    }

    static async getRequestCount(parametersForSearch: RateLimitDbType): Promise<number> {
        const filter = {
            url: parametersForSearch.url,
            ip: parametersForSearch.ip,
            date: { $gte: parametersForSearch.date }
        }

        return rateLimitCollection.countDocuments(filter);
    }
}
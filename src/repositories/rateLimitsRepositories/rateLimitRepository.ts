import { injectable } from "inversify";

import { RateLimitDbType } from "./types";
import { RateLimitModel } from "../../models/rateLimit/rateLimit.entity";

@injectable()
export class RateLimitRepository {
    async clearDB()  {
        return RateLimitModel.collection.drop();
    }

    static async addNewRequest(
        newRequest: RateLimitDbType
    ): Promise<RateLimitDbType> {
        return RateLimitModel.create(newRequest);
    }

    static async getRequestCount(parametersForSearch: RateLimitDbType): Promise<number> {
        const filter = {
            url: parametersForSearch.url,
            ip: parametersForSearch.ip,
            date: { $gte: parametersForSearch.date }
        }

        return RateLimitModel.countDocuments(filter);
    }
}
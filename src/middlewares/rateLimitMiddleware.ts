import { NextFunction, Request, Response } from "express";

import { ioc } from "../composition-root";
import { HttpStatuses } from "../routers/types";
import { RateLimitRepository } from "../repositories/rateLimitsRepositories";

export const rateLimitMiddleware = ({maxAttempts, periodInSec}: {
    maxAttempts: number,
    periodInSec: number
}) => async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    const ip = req.ip || "unknown ip";
    const date = Date.now();

    const rateLimitRepository = ioc.get(RateLimitRepository);

    const dateForSearch = date - (periodInSec * 1000);
    const sameRequestCount = await rateLimitRepository.getRequestCount({url, ip: ip!, date: dateForSearch})

    if(sameRequestCount > maxAttempts - 1){
        res.sendStatus(HttpStatuses.TooManyRequests_429)
        return;
    }

    await rateLimitRepository.addNewRequest({url, ip: ip!, date});

    next();
}
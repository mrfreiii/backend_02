import { NextFunction, Request, Response } from "express";

import { HttpStatuses } from "../routers/types";
import { rateLimitRepository } from "../repositories/rateLimitsRepositories";

export const rateLimitMiddleware = ({maxAttempts, periodInSec}: {
    maxAttempts: number,
    periodInSec: number
}) => async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    const ip = req.ip || "unknown ip";
    const date = Date.now();

    const dateForSearch = date - (periodInSec * 1000);
    const sameRequestCount = await rateLimitRepository.getRequestCount({url, ip: ip!, date: dateForSearch})

    if(sameRequestCount > maxAttempts - 1){
        res.sendStatus(HttpStatuses.TooManyRequests_429)
        return;
    }

    await rateLimitRepository.addNewRequest({url, ip: ip!, date});

    next();
}
import { NextFunction, Request, Response } from "express";
import {validationResult} from 'express-validator';

export const errorResultMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const allErrors = await validationResult(req);

    if(!allErrors.isEmpty()){
        res.status(400).json({
            errorsMessages: allErrors
                .array({onlyFirstError: true})
                .map((error) => {
                    return {
                        message: error.msg,
                        field: (error as any).path,
                    }
                })
        });
        return;
    } else {
        next();
    }
}
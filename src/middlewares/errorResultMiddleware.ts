import { NextFunction, Request, Response } from "express";
import {validationResult} from 'express-validator';

export const errorResultMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const allErrors = validationResult(req);

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
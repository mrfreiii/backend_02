import { body } from "express-validator";

export const commentContentValidator = body('content')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 20, max: 300}).withMessage("length must be: min 20, max 300");

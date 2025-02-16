import { body } from "express-validator";

export const loginOrEmailValidator = body('loginOrEmail')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 200}).withMessage("length must be: min 1, max 200")

export const passwordValidator = body('password')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 200}).withMessage("length must be: min 1, max 200")
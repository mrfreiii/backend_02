import { body } from "express-validator";

export const userLoginValidator = body('login')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 3, max: 10}).withMessage("length must be: min 3, max 10")
    .matches(/^[a-zA-Z0-9_-]*$/).withMessage("allowed symbols: a-z, A-Z, 0-9, _-")

export const userPasswordValidator = body('password')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 6, max: 20}).withMessage("length must be: min 6, max 20")

export const userEmailValidator = body('email')
    .isString().withMessage("value must be a string")
    .isEmail().withMessage("value must be email")

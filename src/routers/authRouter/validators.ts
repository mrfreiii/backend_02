import { body } from "express-validator";

export const loginOrEmailValidator = body('loginOrEmail')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 200}).withMessage("length must be: min 1, max 200")

export const passwordValidator = body('password')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 200}).withMessage("length must be: min 1, max 200")

export const confirmationCodeValidator = body('code')
    .isString().withMessage("value must be a string")

export const passwordRecoveryCodeValidator = body('recoveryCode')
    .isString().withMessage("value must be a string")

export const newPasswordValidator = body('newPassword')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 6, max: 20}).withMessage("length must be: min 6, max 20")
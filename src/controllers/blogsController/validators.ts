import {body} from 'express-validator';

export const blogNameValidator = body('name')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 15}).withMessage("length must be: min 1, max 15");

export const blogDescriptionValidator = body('description')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 500}).withMessage("length must be: min 1, max 500");

export const blogWebsiteUrlValidator = body('websiteUrl')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 100}).withMessage("length must be: min 1, max 100")
    .isURL().withMessage("value must be url address")
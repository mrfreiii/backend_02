import {body} from 'express-validator';
import { blogsRepository } from "../repositories/blogsRepository";

export const postTitleValidator = body('title')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 30}).withMessage("length must be: min 1, max 30");

export const shortDescriptionValidator = body('shortDescription')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 100}).withMessage("length must be: min 1, max 100");

export const contentValidator = body('content')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 1, max: 1000}).withMessage("length must be: min 1, max 1000");

export const blogIdValidator = body('blogId')
    .isString().withMessage("value must be a string")
    .trim()
    .custom((blogId)=>{
        const blog = blogsRepository.getBlogById(blogId);
        return !!blog;
    }).withMessage("blog not found")

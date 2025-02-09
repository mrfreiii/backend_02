import {body} from 'express-validator';
import { blogsRepository } from "../blogs/blogsRepository";

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
    .custom(async (blogId)=>{
        try{
            const blog = await blogsRepository.getBlogById(blogId);
            if(!blog){
                return Promise.reject();
            }
        } catch (e){
            console.log(e)
            return Promise.reject();
        }
    }).withMessage("blog not found")

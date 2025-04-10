import { body } from "express-validator";

export const commentContentValidator = body('content')
    .isString().withMessage("value must be a string")
    .trim().isLength({min: 20, max: 300}).withMessage("length must be: min 20, max 300");

export const likeStatusValidator = body('likeStatus')
    .isString().withMessage("value must be a string")
    .custom(async (likeStatus)=>{
        try{
            const availableStatuses = ["None", "Like", "Dislike"];
            if(!availableStatuses.includes(likeStatus)){
                return Promise.reject();
            }
        } catch {
            return Promise.reject();
        }
    }).withMessage("status must None, Like, or Dislike")
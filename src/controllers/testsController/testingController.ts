import { Router, Request,Response  } from "express";

import { blogsRepository } from "../../repositories/blogsRepositories/blogsRepository";
import { postsRepository } from "../../repositories/postsRepositories/postsRepository";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        try{
            const isBlogsDeleted = await blogsRepository.clearDB();
            const isPostsDeleted = await postsRepository.clearDB();


            if(!isBlogsDeleted || !isPostsDeleted){
                res.sendStatus(599)
                return;
            }

            res.sendStatus(204)
        } catch(e) {
            console.log(e);
            res.sendStatus(599);
        }
    },
}

testingRouter.delete("/all-data", testingController.deleteAllData);
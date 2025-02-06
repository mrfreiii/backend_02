import { Router, Request,Response  } from "express";
import { blogsRepositoryMongoDb } from "../repositories_mongo_db/blogsRepositoryMongoDb";
import { postsRepositoryMongoDb } from "../repositories_mongo_db/postsRepositoryMongoDb";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        try{
            const isBlogsDeleted = await blogsRepositoryMongoDb.clearDB();
            const isPostsDeleted = await postsRepositoryMongoDb.clearDB();


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
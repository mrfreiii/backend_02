import { Router, Request,Response  } from "express";
import { blogsRepositoryMongoDb } from "../repositories_mongo_db/blogsRepositoryMongoDb";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        try{
            const isBlogsDeleted = await blogsRepositoryMongoDb.clearDB();
            // await postsRepositoryInMemory.clearDB();


            if(!isBlogsDeleted){
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
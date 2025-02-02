import { Router, Request,Response  } from "express";
import { blogsRepository } from "../repositories/blogsRepository";
import { postsRepository } from "../repositories/postsRepository";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        blogsRepository.clearDB();
        postsRepository.clearDB();

        res.sendStatus(204)
    },
}

testingRouter.delete("/all-data", testingController.deleteAllData);
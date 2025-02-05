import { Router, Request,Response  } from "express";
import { blogsRepositoryInMemory } from "../repositories_in_memory/blogsRepositoryInMemory";
import { postsRepositoryInMemory } from "../repositories_in_memory/postsRepositoryInMemory";

export const testingRouter = Router();

const testingController = {
    deleteAllData: async (req: Request, res: Response) => {
        await blogsRepositoryInMemory.clearDB();
        await postsRepositoryInMemory.clearDB();

        res.sendStatus(204)
    },
}

testingRouter.delete("/all-data", testingController.deleteAllData);
import { Router } from "express";

import { ioc } from "../../composition-root";
import { TestingController } from "./testingController";

export const testingRouter = Router();
const testingController = ioc.get(TestingController)

testingRouter
    .route("/all-data")
    .delete(testingController.deleteAllData.bind(testingController));
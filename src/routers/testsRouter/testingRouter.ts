import { Router } from "express";

import { TestingController } from "./testingController";
import { compositionRootContainer } from "../../composition-root";

export const testingRouter = Router();
const testingController = compositionRootContainer.get(TestingController)

testingRouter
    .route("/all-data")
    .delete(testingController.deleteAllData.bind(testingController));
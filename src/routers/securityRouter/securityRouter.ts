import { Router } from "express";

import { SecurityController } from "./securityController";
import { compositionRootContainer } from "../../composition-root";

export const securityRouter = Router();
const securityController = compositionRootContainer.get(SecurityController)

securityRouter
    .route("/devices")
    .get(securityController.getActiveSessions.bind(securityController))
    .delete(securityController.deleteAllOtherDevices.bind(securityController));


securityRouter
    .route("/devices/:deviceId")
    .delete(
        securityController.deleteDeviceById.bind(securityController));


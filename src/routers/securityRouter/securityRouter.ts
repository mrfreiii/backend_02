import { Router } from "express";

import { ioc } from "../../composition-root";
import { SecurityController } from "./securityController";

export const securityRouter = Router();
const securityController = ioc.get(SecurityController)

securityRouter
    .route("/devices")
    .get(securityController.getActiveSessions.bind(securityController))
    .delete(securityController.deleteAllOtherDevices.bind(securityController));


securityRouter
    .route("/devices/:deviceId")
    .delete(
        securityController.deleteDeviceById.bind(securityController));


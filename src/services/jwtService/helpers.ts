import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";

import { SETTINGS } from "../../settings";
import { AccessJwtPayloadType, RefreshJwtPayloadType } from "./types";

export const createAccessToken = (userId: string): string => {
    const payload: AccessJwtPayloadType = {
        userId,
        iat: new Date().getTime(),
    }

    return jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "10s"});
}

export const createRefreshToken = (
    {
        userId,
        deviceId
    }: {
        userId: string;
        deviceId: string
    }): string => {
    const payload: RefreshJwtPayloadType = {
        userId,
        deviceId,
        iat: new Date().getTime(),
    }

    return jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "20s"});
}

export const getDeviceTitle = (userAgent: string | undefined): string => {
    if (!userAgent) {
        return "unknown device"
    }

    const parsedUA = new UAParser(userAgent);
    const browser = parsedUA.getBrowser();
    const os = parsedUA.getOS();
    return `Browser: ${browser.name} ${browser.version}; OS: ${os.name} ${os.version}`;
}
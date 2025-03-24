import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";

import { SETTINGS } from "../../settings";
import { AccessJwtPayloadType, RefreshJwtPayloadType } from "./types";

export const createAccessToken = (userId: string): string => {
    const payload: AccessJwtPayloadType = {
        userId,
    }

    return jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "10s"});
}

export const createRefreshToken = async (
    {
        userId,
        deviceId
    }: {
        userId: string;
        deviceId: string
    }): Promise<string> => {
    const payload: RefreshJwtPayloadType = {
        userId,
        deviceId,
    }

    // need using setTimeout for testing purpose
    return new Promise((resolve)=>{
        setTimeout(()=>{
            const refreshToken = jwt.sign(payload, SETTINGS.JWT_SECRET, {expiresIn: "20s"});
            resolve(refreshToken)
        },500)
    })


}

export const getDeviceTitle = (userAgent: string | undefined): string =>{
    if(!userAgent){
        return "unknown device"
    }

    const parsedUA = new UAParser(userAgent);
    const browser = parsedUA.getBrowser();
    const os = parsedUA.getOS();
    return `Browser: ${browser.name} ${browser.version}; OS: ${os.name} ${os.version}`;
}
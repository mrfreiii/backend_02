import { jwtDecode } from "jwt-decode";
import { RefreshJwtPayloadType } from "../../services/jwtService/types";

export const getDeviceIdFromRefreshTokenCookie = (cookie: string): string => {
    const refreshTokenCookie = (cookie as unknown as string[])?.find((v) => v?.includes("refreshToken"));
    const refreshToken = refreshTokenCookie?.split("=")[1] || "";

    const decodedToken = jwtDecode(refreshToken) as RefreshJwtPayloadType;
    return decodedToken?.deviceId;
}
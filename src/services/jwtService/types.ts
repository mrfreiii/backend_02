export type AccessJwtPayloadType = {
    userId: string;
    iat: number;
}

export type RefreshJwtPayloadType = {
    userId: string;
    deviceId: string;
    iat: number;
}
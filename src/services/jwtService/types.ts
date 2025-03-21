export type AccessJwtPayloadType = {
    userId: string;
}

export type RefreshJwtPayloadType = {
    userId: string;
    deviceId: string;
}
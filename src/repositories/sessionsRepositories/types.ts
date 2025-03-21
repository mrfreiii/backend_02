export type SessionDbType = {
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    issuedAt: string;
    expirationTime: string;
}

export type SessionViewType = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
}
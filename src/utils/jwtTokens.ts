export const getDatesFromToken = (token: string): {issuedAt: string; expirationTime: string} => {
    const splitToken = token.split(".");
    const tokenPayload = splitToken[1];
    const decodedPayload = Buffer.from(tokenPayload, 'base64') as unknown as {iat: Date; exp: Date};

    return {
        issuedAt: decodedPayload?.iat?.toISOString() || "",
        expirationTime: decodedPayload?.exp?.toISOString() || "",
    }
}
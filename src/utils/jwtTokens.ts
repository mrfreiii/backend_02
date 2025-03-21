import { jwtDecode } from "jwt-decode";

export const getDatesFromToken = (token: string): {
    issuedAt: string;
    expirationTime: string
} => {
    const decodedToken = jwtDecode(token);

    return {
        issuedAt: decodedToken?.iat ? new Date(decodedToken?.iat * 1000).toISOString() : "",
        expirationTime: decodedToken?.exp ? new Date(decodedToken?.exp * 1000).toISOString() : "",
    }
}
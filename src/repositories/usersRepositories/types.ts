export type UserViewType = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
}

export type UserDbType = {
    accountData: {
        login: string;
        email: string;
        createdAt: string;
        passwordHash: string;
    }
    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: number | null;
        confirmationStatus: "confirmed" | "notConfirmed";
    }
    tokens?: {
        refreshTokenBlackList: string[];
    }
}
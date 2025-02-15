export type UserViewType = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
}

export type UserDbType = {
    login: string;
    email: string;
    createdAt: string;
    passwordHash: string;
    passwordSalt: string;
}
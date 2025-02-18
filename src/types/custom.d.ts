import { UserViewType } from "../repositories/usersRepositories/types";

declare global {
    namespace Express {
        export interface Request {
            user?: UserViewType;
        }
    }
}
import { Request, Response } from "express";

import { WithPaginationType } from "../../types";
import { UserViewType } from "../../repositories/usersRepositories/types";

export type UserQueryType = {
    sortBy: string;
    sortDirection: string | number;
    pageNumber: number;
    pageSize: number;
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;
}

export type GetAllUsersReqType = Request<{}, {}, {}, UserQueryType>;
export type GetAllUsersResType = Response<WithPaginationType<UserViewType>>;

export type CreateUserReqType = Request<{}, {}, {login: string; email: string; password: string}>;
export type CreateUserResType = Response<UserViewType | {errorsMessages: {field: string, message: string}[]}>;

export type DeleteUserByIdReqType = Request<{ id: string }>;
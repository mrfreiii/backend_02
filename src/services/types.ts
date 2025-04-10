export enum ResultStatus {
    Success_200 = 'Success_200',
    NotFound_404 = 'NotFound_404',
    Forbidden_403 = 'Forbidden_403',
    Unauthorized_401 = 'Unauthorized_401',
    BadRequest_400 = 'BadRequest_400',
    ServerError_500 = 'ServerError_500',
}

type ExtensionType = {
    field: string;
    message: string;
};

export type ResultType<T = null> = {
    status: ResultStatus;
    errorMessage?: string;
    extensions: ExtensionType[];
    data: T;
};
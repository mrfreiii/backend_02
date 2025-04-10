import { HttpStatuses } from "./types";
import { ResultStatus } from "../services/types";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.BadRequest_400:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Forbidden_403:
            return HttpStatuses.Forbidden_403;
        case ResultStatus.Unauthorized_401:
            return HttpStatuses.Unauthorized_401;
        case ResultStatus.NotFound_404:
            return HttpStatuses.NotFound_404;
        case ResultStatus.ServerError_500:
            return HttpStatuses.ServerError_500;
        default:
            return HttpStatuses.ServerError_500;
    }
};

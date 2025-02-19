import { HttpStatuses } from "./types";
import { ResultStatus } from "../services/types";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.BadRequest:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Forbidden:
            return HttpStatuses.Forbidden_403;
        case ResultStatus.Unauthorized:
            return HttpStatuses.Unauthorized_401;
        case ResultStatus.NotFound:
            return HttpStatuses.NotFound_404;
        case ResultStatus.ServerError:
            return HttpStatuses.ServerError_500;
        default:
            return HttpStatuses.ServerError_500;
    }
};


import { ResponseHandler } from "../utils/ResponseHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Request, Response, NextFunction } from "express";
import { log } from "../utils/winstonLogger.js";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): any {
    log.error(`🔥 ERROR:\n ${err}`);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            status: "fail",
            message: err.message,
        });
    }
    return ResponseHandler.serverError(res, err.message || "Something went wrong");
}

import { Response } from "express";

export class ResponseHandler {
  static success(res: Response, data = {}, message = "Success") {
    return res.status(200).json({
      status: "success",
      message,
      data,
    });
  }

  static created(res: Response, data = {}, message = "Created") {
    return res.status(201).json({
      status: "success",
      message,
      data,
    });
  }

  static badRequest(res: Response, message = "Bad Request") {
    return res.status(400).json({
      status: "fail",
      message,
    });
  }

  static unauthorized(res: Response, message = "Unauthorized") {
    return res.status(401).json({
      status: "fail",
      message,
    });
  }

  static forbidden(res: Response, message = "Forbidden") {
    return res.status(403).json({
      status: "fail",
      message,
    });
  }

  static notFound(res: Response, message = "Not Found") {
    return res.status(404).json({
      status: "fail",
      message,
    });
  }

  static conflict(res: Response, message = "Conflict") {
    return res.status(409).json({
      status: "fail",
      message,
    });
  }

   static error(res:Response, status:number, message:string, error = {}) {
    return res.status(status).json({ success: false, message, error });
  }

  static serverError(res: Response, message = "Internal Server Error") {
    return res.status(500).json({
      status: "error",
      message,
    });
  }
}

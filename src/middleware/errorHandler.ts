/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import "dotenv/config";
import AppError from "../errorHelpers/AppError";
import { ApiResponse } from "../interfaces";

export const globalErrorHandler = async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    let statusCode = status.INTERNAL_SERVER_ERROR as number;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    console.error(
        `\x1b[31m[ERROR]\x1b[0m ${req.method} ${req.path} → ${statusCode} ${message}${
            err instanceof Error && statusCode >= 500 ? `\n${err.stack}` : ''
        }`
    );

    const errorResponse: ApiResponse = { success: false, message };
    res.status(statusCode).json(errorResponse);
};

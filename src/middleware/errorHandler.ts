

/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import "dotenv/config";

export interface TErrorSources {
    path: string;
    message: string;
}

export interface TErrorResponse {
    statusCode?: number;
    success: boolean;
    message: string;
    errorSources: TErrorSources[];
    stack?: string;
    error?: unknown;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
        console.log("Error from Global Error Handler", err);
    }

    let errorSources: TErrorSources[] = []
    let statusCode: number = status.INTERNAL_SERVER_ERROR ;
    let message: string = 'Internal Server Error';
    let stack: string | undefined = undefined;
    

    
    const errorResponse: TErrorResponse = {
        success: false,
        message: message,
        errorSources,
        error: process.env.NODE_ENV === 'development' ? err : undefined,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    }

    res.status(statusCode).json(errorResponse);

}
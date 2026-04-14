import { Request, Response } from "express";
import status from "http-status";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { authService } from "./auth.service.js";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const register = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED as number,
        success: true,
        message: "Registered successfully",
        data: user,
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { user, session } = await authService.login(req.body);

    // manually set HTTP-only session cookie
    res.cookie("better-auth.session_token", session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(session.expiresAt),
        path: "/",
    });

    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "Logged in successfully",
        data: user,
    });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    await auth.api.signOut({ headers: fromNodeHeaders(req.headers) });

    res.clearCookie("better-auth.session_token", { path: "/" });

    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "Logged out successfully",
    });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "User fetched successfully",
        data: req.user,
    });
});

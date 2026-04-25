import { Request, Response } from "express";
import status from "http-status";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { authService } from "./auth.service.js";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { prisma } from "../../lib/prisma.js";

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
    const { user, sessionToken, accessToken, refreshToken } = await authService.login(req.body);

    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "Logged in successfully",
        data: { user, accessToken, sessionToken },
    });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    await auth.api.signOut({ headers: fromNodeHeaders(req.headers) });

    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "Logged out successfully",
    });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    sendResponse(res, {
        httpStatusCode: status.OK as number,
        success: true,
        message: "User fetched successfully",
        data: user,
    });
});

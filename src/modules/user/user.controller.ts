import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { userService } from "./user.service.js";
import AppError from "../../errorHelpers/AppError.js";
import { UserRole } from "../../generated/prisma/enums.js";
import status from "http-status";

export const addUser = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new AppError(status.BAD_REQUEST as number, "name, email, password and role are required");
    }

    if (!req.body.campusDepartmentId) {
        throw new AppError(status.BAD_REQUEST as number, "campusDepartmentId is required");
    }

    const data = await userService.addUser(req.body, req.user!.id, req.user!.role as UserRole);

    sendResponse(res, {
        httpStatusCode: status.CREATED as number,
        success: true,
        message: `${role} added successfully`,
        data,
    });
});

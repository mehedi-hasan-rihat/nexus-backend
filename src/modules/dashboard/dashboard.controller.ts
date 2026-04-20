import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { getDashboard } from "./dashboard.service.js";
import { UserRole } from "../../generated/prisma/enums.js";

export const dashboard = catchAsync(async (req: Request, res: Response) => {
    const data = await getDashboard(req.user!.userId, req.user!.role as UserRole);

    sendResponse(res, { httpStatusCode: 200, success: true, message: "Dashboard fetched", data });
});

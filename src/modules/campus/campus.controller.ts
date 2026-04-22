import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { campusService } from "./campus.service.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const initiateCampusRegistration = catchAsync(async (req: Request, res: Response) => {
    const { campusName, campusCode, address, principal } = req.body;

    if (!campusName || !campusCode) throw new AppError(status.BAD_REQUEST as number, "campusName and campusCode are required");
    if (!principal?.name || !principal?.email || !principal?.password) throw new AppError(status.BAD_REQUEST as number, "principal name, email and password are required");

    const data = await campusService.initiateCampusRegistration(req.body);

    sendResponse(res, {
        httpStatusCode: status.CREATED as number,
        success: true,
        message: "Campus registration initiated. Complete payment to activate.",
        data,
    });
});

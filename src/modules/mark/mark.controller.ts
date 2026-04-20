import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { markService } from "./mark.service.js";
import { AssessmentType, UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const getMarks = catchAsync(async (req: Request, res: Response) => {
    const subjectId = req.query.subjectId as string | undefined;
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    const data = await markService.getMarks(req.user!.userId, req.user!.role as UserRole, subjectId, semester);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Marks fetched", data });
});

export const bulkUpsertMarks = catchAsync(async (req: Request, res: Response) => {
    const { subjectId, assessmentType, assessmentNo, marks } = req.body;

    if (!subjectId || !assessmentType || !assessmentNo || !Array.isArray(marks) || marks.length === 0) {
        throw new AppError(status.BAD_REQUEST as number, "subjectId, assessmentType, assessmentNo and marks[] are required");
    }

    if (!Object.values(AssessmentType).includes(assessmentType)) {
        throw new AppError(status.BAD_REQUEST as number, `assessmentType must be one of: ${Object.values(AssessmentType).join(", ")}`);
    }

    const data = await markService.bulkUpsertMarks(req.user!.userId, req.user!.role as UserRole, {
        subjectId,
        assessmentType: assessmentType as AssessmentType,
        assessmentNo: Number(assessmentNo),
        marks,
    });

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Marks saved", data });
});

import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { subjectService } from "./subject.service.js";
import { CreditType, UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const createSubject = catchAsync(async (req: Request, res: Response) => {
    const { campusDepartmentId, name, code, semester, maxMarks, credit } = req.body;
    if (!campusDepartmentId || !name || !code || !semester || !maxMarks || !credit) {
        throw new AppError(status.BAD_REQUEST as number, "campusDepartmentId, name, code, semester, maxMarks and credit are required");
    }
    const data = await subjectService.createSubject(req.user!.userId, req.user!.role as UserRole, {
        campusDepartmentId, name, code, semester: Number(semester), maxMarks: Number(maxMarks), credit: credit as CreditType,
    });
    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Subject created", data });
});

export const getSubjects = catchAsync(async (req: Request, res: Response) => {
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    const data = await subjectService.getSubjects(req.user!.userId, req.user!.role as UserRole, semester);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Subjects fetched", data });
});

export const updateSubject = catchAsync(async (req: Request, res: Response) => {
    const { name, code, semester, maxMarks, credit } = req.body;
    const data = await subjectService.updateSubject(req.user!.userId, req.user!.role as UserRole, req.params.id, {
        ...(name && { name }),
        ...(code && { code }),
        ...(semester && { semester: Number(semester) }),
        ...(maxMarks && { maxMarks: Number(maxMarks) }),
        ...(credit && { credit: credit as CreditType }),
    });
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Subject updated", data });
});

export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
    await subjectService.deleteSubject(req.user!.userId, req.user!.role as UserRole, req.params.id);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Subject deleted" });
});

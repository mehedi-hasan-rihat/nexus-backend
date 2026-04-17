import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { teacherService } from "./teacher.service.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const createTeacher = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, campusDepartmentId } = req.body;
    if (!name || !email || !password || !campusDepartmentId) {
        throw new AppError(status.BAD_REQUEST as number, "name, email, password and campusDepartmentId are required");
    }

    const data = await teacherService.createTeacher(req.user!.userId, req.body);

    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Teacher created", data });
});

export const getTeachers = catchAsync(async (req: Request, res: Response) => {
    const data = await teacherService.getTeachers(req.user!.userId, req.user!.role as UserRole);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Teachers fetched", data });
});

export const updateTeacher = catchAsync(async (req: Request, res: Response) => {
    const data = await teacherService.updateTeacher(req.user!.userId, req.params.id, req.body);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Teacher updated", data });
});

export const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
    await teacherService.deleteTeacher(req.user!.userId, req.params.id);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Teacher deleted" });
});

import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { studentService } from "./student.service.js";
import { UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const createStudent = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password, campusDepartmentId, roll, rollNumber, session, semester, shift } = req.body;
    const resolvedRoll = roll || rollNumber;
    const resolvedSession = session || `${new Date().getFullYear()}`;
    const resolvedShift = shift || "MORNING";

    if (!name || !email || !password || !campusDepartmentId || !resolvedRoll || !semester) {
        throw new AppError(status.BAD_REQUEST as number, "name, email, password, campusDepartmentId, roll and semester are required");
    }

    const data = await studentService.createStudent(req.user!.userId, req.user!.role as UserRole, {
        ...req.body,
        roll: resolvedRoll,
        session: resolvedSession,
        shift: resolvedShift,
    });

    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Student created", data });
});

export const getStudents = catchAsync(async (req: Request, res: Response) => {
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    const data = await studentService.getStudents(req.user!.userId, req.user!.role as UserRole, semester);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Students fetched", data });
});

export const updateStudent = catchAsync(async (req: Request, res: Response) => {
    const { roll, rollNumber, session, semester, shift, campusDepartmentId } = req.body;

    const data = await studentService.updateStudent(
        req.user!.userId,
        req.user!.role as UserRole,
        req.params.id as string,
        {
            roll: roll || rollNumber,
            session,
            semester,
            shift,
            campusDepartmentId,
        }
    );

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Student updated", data });
});

export const deleteStudent = catchAsync(async (req: Request, res: Response) => {
    await studentService.deleteStudent(req.user!.userId, req.user!.role as UserRole, req.params.id);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Student deleted" });
});

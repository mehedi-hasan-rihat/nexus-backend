import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { departmentService } from "./department.service.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

export const createDepartment = catchAsync(async (req: Request, res: Response) => {
    const { name, shortName } = req.body;
    if (!name || !shortName) throw new AppError(status.BAD_REQUEST as number, "name and shortName are required");

    const data = await departmentService.createDepartment(req.user!.id, { name, shortName });

    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Department created", data });
});

export const getDepartments = catchAsync(async (req: Request, res: Response) => {
    const data = await departmentService.getDepartments(req.user!.id);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Departments fetched", data });
});

export const updateDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, shortName } = req.body;
    if (!name && !shortName) throw new AppError(status.BAD_REQUEST as number, "name or shortName is required");

    const data = await departmentService.updateDepartment(req.user!.id, id, { name, shortName });

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Department updated", data });
});

export const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
    await departmentService.deleteDepartment(req.user!.id, req.params.id);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Department removed from campus" });
});

export const assignHOD = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new AppError(status.BAD_REQUEST as number, "name, email and password are required");

    const data = await departmentService.assignHOD(req.user!.id, req.params.id, { name, email, password });

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD assigned", data });
});

export const changeHOD = catchAsync(async (req: Request, res: Response) => {
    const { hodId } = req.body;
    if (!hodId) throw new AppError(status.BAD_REQUEST as number, "hodId is required");

    const data = await departmentService.changeHOD(req.user!.id, req.params.id, hodId);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD changed", data });
});

export const removeHOD = catchAsync(async (req: Request, res: Response) => {
    const data = await departmentService.removeHOD(req.user!.id, req.params.id);

    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD removed", data });
});

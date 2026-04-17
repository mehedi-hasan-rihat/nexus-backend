import { Request, Response } from "express";
import { catchAsync } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { departmentService } from "./department.service.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

// SuperAdmin: bulk create global departments
export const createDepartmentsBulk = catchAsync(async (req: Request, res: Response) => {
    const departments = req.body;
    if (!Array.isArray(departments) || departments.length === 0)
        throw new AppError(status.BAD_REQUEST as number, "Provide an array of departments");

    const data = await prisma.department.createMany({
        data: departments.map((d: { name: string; shortName: string }) => ({
            name: d.name,
            shortName: d.shortName,
        })),
        skipDuplicates: true,
    });

    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: `${data.count} departments seeded`, data });
});

// SuperAdmin: create a global department
export const createDepartment = catchAsync(async (req: Request, res: Response) => {
    const { name, shortName } = req.body;
    if (!name || !shortName) throw new AppError(status.BAD_REQUEST as number, "name and shortName are required");

    const existing = await prisma.department.findUnique({ where: { shortName } });
    if (existing) throw new AppError(status.CONFLICT as number, "Department with this shortName already exists");

    const data = await prisma.department.create({ data: { name, shortName } });
    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Department created", data });
});

// GET /api/departments — public list for principal to pick from
export const getAllDepartments = catchAsync(async (_req: Request, res: Response) => {
    const data = await departmentService.getAllDepartments();
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Departments fetched", data });
});

// POST /api/principal/departments — add existing dept to campus
export const addDepartmentToCampus = catchAsync(async (req: Request, res: Response) => {
    const { departmentId } = req.body;
    if (!departmentId) throw new AppError(status.BAD_REQUEST as number, "departmentId is required");

    const data = await departmentService.addDepartmentToCampus(req.user!.userId, departmentId);
    sendResponse(res, { httpStatusCode: status.CREATED as number, success: true, message: "Department added to campus", data });
});

// GET /api/principal/departments — get campus departments
export const getCampusDepartments = catchAsync(async (req: Request, res: Response) => {
    const data = await departmentService.getCampusDepartments(req.user!.userId);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Campus departments fetched", data });
});

// DELETE /api/principal/departments/:id — remove dept from campus
export const removeDepartmentFromCampus = catchAsync(async (req: Request, res: Response) => {
    await departmentService.removeDepartmentFromCampus(req.user!.userId, req.params.id as string);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "Department removed from campus" });
});

// POST /api/principal/departments/:id/hod — create new user as HOD
export const assignHOD = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new AppError(status.BAD_REQUEST as number, "name, email and password are required");

    const data = await departmentService.assignHOD(req.user!.userId, req.params.id as string, { name, email, password });
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD assigned", data });
});

// PATCH /api/principal/departments/:id/hod — assign existing user as HOD
export const changeHOD = catchAsync(async (req: Request, res: Response) => {
    const { hodId } = req.body;
    if (!hodId) throw new AppError(status.BAD_REQUEST as number, "hodId is required");

    const data = await departmentService.changeHOD(req.user!.userId, req.params.id as string, hodId);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD changed", data });
});

// DELETE /api/principal/departments/:id/hod — remove HOD
export const removeHOD = catchAsync(async (req: Request, res: Response) => {
    const data = await departmentService.removeHOD(req.user!.userId, req.params.id as string);
    sendResponse(res, { httpStatusCode: status.OK as number, success: true, message: "HOD removed", data });
});

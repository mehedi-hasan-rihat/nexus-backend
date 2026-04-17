import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

const getPrincipalCampus = async (principalId: string) => {
    const campus = await prisma.campus.findUnique({ where: { principalId } });
    if (!campus) throw new AppError(status.NOT_FOUND as number, "No campus found for this principal");
    return campus;
};

const assertCampusDeptOwnership = async (principalId: string, campusDepartmentId: string) => {
    const campus = await getPrincipalCampus(principalId);
    const campusDept = await prisma.campusDepartment.findFirst({
        where: { id: campusDepartmentId, campusId: campus.id },
    });
    if (!campusDept) throw new AppError(status.NOT_FOUND as number, "Department not found in your campus");
    return { campus, campusDept };
};

const createDepartment = async (principalId: string, payload: { name: string; shortName: string }) => {
    const campus = await getPrincipalCampus(principalId);

    return prisma.$transaction(async (tx) => {
        const dept = await tx.department.upsert({
            where: { shortName: payload.shortName },
            update: {},
            create: { name: payload.name, shortName: payload.shortName },
        });

        return tx.campusDepartment.upsert({
            where: { campusId_departmentId: { campusId: campus.id, departmentId: dept.id } },
            update: {},
            create: { campusId: campus.id, departmentId: dept.id },
            include: { department: true },
        });
    });
};

const getDepartments = async (principalId: string) => {
    const campus = await getPrincipalCampus(principalId);

    return prisma.campusDepartment.findMany({
        where: { campusId: campus.id },
        include: {
            department: true,
            hod: { select: { id: true, name: true, email: true } },
        },
    });
};

const updateDepartment = async (principalId: string, campusDepartmentId: string, payload: { name?: string; shortName?: string }) => {
    const { campusDept } = await assertCampusDeptOwnership(principalId, campusDepartmentId);

    return prisma.department.update({
        where: { id: campusDept.departmentId },
        data: payload,
    });
};

const deleteDepartment = async (principalId: string, campusDepartmentId: string) => {
    await assertCampusDeptOwnership(principalId, campusDepartmentId);

    return prisma.campusDepartment.delete({ where: { id: campusDepartmentId } });
};

const assignHOD = async (principalId: string, campusDepartmentId: string, hodPayload: { name: string; email: string; password: string }) => {
    await assertCampusDeptOwnership(principalId, campusDepartmentId);

    const registered = await auth.api.signUpEmail({ body: hodPayload });
    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create HOD user");

    try {
        return await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: registered.user.id },
                data: { role: UserRole.HOD, isActive: true },
            });

            return tx.campusDepartment.update({
                where: { id: campusDepartmentId },
                data: { hodId: registered.user.id },
                include: { department: true, hod: { select: { id: true, name: true, email: true, role: true } } },
            });
        });
    } catch (error) {
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

const changeHOD = async (principalId: string, campusDepartmentId: string, newHodId: string) => {
    await assertCampusDeptOwnership(principalId, campusDepartmentId);

    const user = await prisma.user.findUnique({ where: { id: newHodId } });
    if (!user) throw new AppError(status.NOT_FOUND as number, "User not found");
    if (user.role !== UserRole.HOD && user.role !== UserRole.TEACHER) {
        throw new AppError(status.BAD_REQUEST as number, "User must be a HOD or TEACHER to be assigned as HOD");
    }

    return prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: newHodId }, data: { role: UserRole.HOD } });

        return tx.campusDepartment.update({
            where: { id: campusDepartmentId },
            data: { hodId: newHodId },
            include: { department: true, hod: { select: { id: true, name: true, email: true, role: true } } },
        });
    });
};

const removeHOD = async (principalId: string, campusDepartmentId: string) => {
    await assertCampusDeptOwnership(principalId, campusDepartmentId);

    return prisma.campusDepartment.update({
        where: { id: campusDepartmentId },
        data: { hodId: null },
        include: { department: true },
    });
};

export const departmentService = {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    assignHOD,
    changeHOD,
    removeHOD,
};

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

const assertTeacherOwnership = async (principalId: string, teacherId: string) => {
    const campus = await getPrincipalCampus(principalId);
    const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, campusDepartment: { campusId: campus.id } },
        include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } }, campusDepartment: { include: { department: true } } },
    });
    if (!teacher) throw new AppError(status.NOT_FOUND as number, "Teacher not found in your campus");
    return teacher;
};

const createTeacher = async (
    principalId: string,
    payload: {
        name: string;
        email: string;
        password: string;
        campusDepartmentId: string;
        employeeId?: string;
        designation?: string;
        qualification?: string;
    }
) => {
    const campus = await getPrincipalCampus(principalId);

    const campusDept = await prisma.campusDepartment.findFirst({
        where: { id: payload.campusDepartmentId, campusId: campus.id },
    });
    if (!campusDept) throw new AppError(status.NOT_FOUND as number, "Department not found in your campus");

    const registered = await auth.api.signUpEmail({ body: { name: payload.name, email: payload.email, password: payload.password } });
    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create teacher user");

    try {
        return await prisma.$transaction(async (tx) => {
            await tx.user.update({ where: { id: registered.user.id }, data: { role: UserRole.TEACHER, isActive: true } });

            return tx.teacher.create({
                data: {
                    userId: registered.user.id,
                    campusDepartmentId: payload.campusDepartmentId,
                    employeeId: payload.employeeId,
                    designation: payload.designation,
                    qualification: payload.qualification,
                },
                include: { user: { select: { id: true, name: true, email: true, role: true } }, campusDepartment: { include: { department: true } } },
            });
        });
    } catch (error) {
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

const getTeachers = async (userId: string, role: UserRole) => {
    let campusId: string;

    if (role === UserRole.PRINCIPAL) {
        const campus = await getPrincipalCampus(userId);
        campusId = campus.id;
    } else {
        // HOD or TEACHER — resolve campus via their teacher record
        const teacher = await prisma.teacher.findFirst({
            where: { userId },
            include: { campusDepartment: true },
        });
        if (!teacher) throw new AppError(status.NOT_FOUND as number, "No campus department found for this user");
        campusId = teacher.campusDepartment.campusId;
    }

    return prisma.teacher.findMany({
        where: { campusDepartment: { campusId } },
        include: {
            user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
            campusDepartment: { include: { department: true } },
        },
    });
};

const updateTeacher = async (
    principalId: string,
    teacherId: string,
    payload: { employeeId?: string; designation?: string; qualification?: string; campusDepartmentId?: string }
) => {
    const teacher = await assertTeacherOwnership(principalId, teacherId);

    if (payload.campusDepartmentId) {
        const campus = await getPrincipalCampus(principalId);
        const campusDept = await prisma.campusDepartment.findFirst({
            where: { id: payload.campusDepartmentId, campusId: campus.id },
        });
        if (!campusDept) throw new AppError(status.NOT_FOUND as number, "Target department not found in your campus");
    }

    return prisma.teacher.update({
        where: { id: teacher.id },
        data: payload,
        include: { user: { select: { id: true, name: true, email: true, role: true } }, campusDepartment: { include: { department: true } } },
    });
};

const deleteTeacher = async (principalId: string, teacherId: string) => {
    const teacher = await assertTeacherOwnership(principalId, teacherId);

    await prisma.$transaction(async (tx) => {
        await tx.teacher.delete({ where: { id: teacher.id } });
        await tx.user.delete({ where: { id: teacher.userId } });
    });
};

export const teacherService = { createTeacher, getTeachers, updateTeacher, deleteTeacher };

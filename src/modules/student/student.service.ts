import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { Shift, UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

const studentInclude = {
    user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
    campusDepartment: { include: { department: true } },
};

const resolveCampusId = async (userId: string, role: UserRole): Promise<string> => {
    if (role === UserRole.PRINCIPAL) {
        const campus = await prisma.campus.findUnique({ where: { principalId: userId } });
        if (!campus) throw new AppError(status.NOT_FOUND as number, "No campus found for this principal");
        return campus.id;
    }

    const teacher = await prisma.teacher.findFirst({
        where: { userId },
        include: { campusDepartment: true },
    });
    if (!teacher) throw new AppError(status.NOT_FOUND as number, "No campus department found for this user");
    return teacher.campusDepartment.campusId;
};

const assertCampusDeptOwnership = async (userId: string, role: UserRole, campusDepartmentId: string) => {
    const campusId = await resolveCampusId(userId, role);
    const campusDept = await prisma.campusDepartment.findFirst({
        where: { id: campusDepartmentId, campusId },
    });
    if (!campusDept) throw new AppError(status.NOT_FOUND as number, "Department not found in your campus");
    return campusDept;
};

const assertStudentOwnership = async (userId: string, role: UserRole, studentId: string) => {
    const campusId = await resolveCampusId(userId, role);
    const student = await prisma.student.findFirst({
        where: { id: studentId, campusDepartment: { campusId } },
        include: studentInclude,
    });
    if (!student) throw new AppError(status.NOT_FOUND as number, "Student not found in your campus");
    return student;
};

const createStudent = async (
    userId: string,
    role: UserRole,
    payload: {
        name: string;
        email: string;
        password: string;
        campusDepartmentId: string;
        roll: string;
        session: string;
        semester: number;
        shift: Shift;
    }
) => {
    await assertCampusDeptOwnership(userId, role, payload.campusDepartmentId);

    const registered = await auth.api.signUpEmail({
        body: { name: payload.name, email: payload.email, password: payload.password },
    });
    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create student user");

    try {
        return await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: registered.user.id },
                data: { role: UserRole.STUDENT, isActive: true },
            });

            return tx.student.create({
                data: {
                    userId: registered.user.id,
                    campusDepartmentId: payload.campusDepartmentId,
                    roll: payload.roll,
                    session: payload.session,
                    semester: payload.semester,
                    shift: payload.shift,
                },
                include: studentInclude,
            });
        });
    } catch (error) {
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

const getStudents = async (userId: string, role: UserRole, semester?: number) => {
    const campusId = await resolveCampusId(userId, role);

    return prisma.student.findMany({
        where: { campusDepartment: { campusId }, ...(semester ? { semester } : {}) },
        include: studentInclude,
        orderBy: { roll: "asc" },
    });
};

const updateStudent = async (
    userId: string,
    role: UserRole,
    studentId: string,
    payload: { roll?: string; session?: string; semester?: number; shift?: Shift; campusDepartmentId?: string }
) => {
    const student = await assertStudentOwnership(userId, role, studentId);

    if (payload.campusDepartmentId) {
        await assertCampusDeptOwnership(userId, role, payload.campusDepartmentId);
    }

    const updateData = Object.fromEntries(
        Object.entries({ roll: payload.roll, session: payload.session, semester: payload.semester, shift: payload.shift, campusDepartmentId: payload.campusDepartmentId })
            .filter(([, v]) => v !== undefined)
    );

    return prisma.student.update({
        where: { id: student.id },
        data: updateData,
        include: studentInclude,
    });
};

const deleteStudent = async (userId: string, role: UserRole, studentId: string) => {
    const student = await assertStudentOwnership(userId, role, studentId);

    await prisma.$transaction(async (tx) => {
        await tx.student.delete({ where: { id: student.id } });
        await tx.user.delete({ where: { id: student.userId } });
    });
};

export const studentService = { createStudent, getStudents, updateStudent, deleteStudent };

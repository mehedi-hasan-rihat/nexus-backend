import { prisma } from "../../lib/prisma.js";
import { CreditType, UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

const resolveCampusId = async (userId: string, role: UserRole): Promise<string> => {
    if (role === UserRole.PRINCIPAL) {
        const campus = await prisma.campus.findUnique({ where: { principalId: userId } });
        if (!campus) throw new AppError(status.NOT_FOUND as number, "No campus found");
        return campus.id;
    }
    const teacher = await prisma.teacher.findFirst({ where: { userId }, include: { campusDepartment: true } });
    if (!teacher) throw new AppError(status.NOT_FOUND as number, "No campus found for this user");
    return teacher.campusDepartment.campusId;
};

const assertCampusDeptOwnership = async (userId: string, role: UserRole, campusDepartmentId: string) => {
    const campusId = await resolveCampusId(userId, role);
    const dept = await prisma.campusDepartment.findFirst({ where: { id: campusDepartmentId, campusId } });
    if (!dept) throw new AppError(status.NOT_FOUND as number, "Department not found in your campus");
    return dept;
};

const subjectInclude = { campusDepartment: { include: { department: true } } };

const createSubject = async (
    userId: string,
    role: UserRole,
    payload: { campusDepartmentId: string; name: string; code: string; semester: number; maxMarks: number; credit: CreditType }
) => {
    await assertCampusDeptOwnership(userId, role, payload.campusDepartmentId);
    return prisma.subject.create({ data: payload, include: subjectInclude });
};

const getSubjects = async (userId: string, role: UserRole, semester?: number) => {
    const campusId = await resolveCampusId(userId, role);
    return prisma.subject.findMany({
        where: { campusDepartment: { campusId }, ...(semester ? { semester } : {}) },
        include: subjectInclude,
        orderBy: [{ semester: "asc" }, { name: "asc" }],
    });
};

const updateSubject = async (
    userId: string,
    role: UserRole,
    subjectId: string,
    payload: Partial<{ name: string; code: string; semester: number; maxMarks: number; credit: CreditType }>
) => {
    const campusId = await resolveCampusId(userId, role);
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, campusDepartment: { campusId } } });
    if (!subject) throw new AppError(status.NOT_FOUND as number, "Subject not found");
    return prisma.subject.update({ where: { id: subjectId }, data: payload, include: subjectInclude });
};

const deleteSubject = async (userId: string, role: UserRole, subjectId: string) => {
    const campusId = await resolveCampusId(userId, role);
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, campusDepartment: { campusId } } });
    if (!subject) throw new AppError(status.NOT_FOUND as number, "Subject not found");
    await prisma.subject.delete({ where: { id: subjectId } });
};

export const subjectService = { createSubject, getSubjects, updateSubject, deleteSubject };

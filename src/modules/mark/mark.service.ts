import { prisma } from "../../lib/prisma.js";
import { AssessmentType, UserRole } from "../../generated/prisma/enums.js";
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

const markInclude = {
    student: {
        select: {
            id: true,
            roll: true,
            semester: true,
            user: { select: { id: true, name: true, email: true } },
        },
    },
    subject: { select: { id: true, name: true, code: true, semester: true, maxMarks: true } },
};

const getMarks = async (userId: string, role: UserRole, subjectId?: string, semester?: number) => {
    const campusId = await resolveCampusId(userId, role);
    return prisma.mark.findMany({
        where: {
            campusDepartment: { campusId },
            ...(subjectId ? { subjectId } : {}),
            ...(semester ? { subject: { semester } } : {}),
        },
        include: markInclude,
        orderBy: { submittedAt: "desc" },
    });
};

const bulkUpsertMarks = async (
    userId: string,
    role: UserRole,
    payload: {
        subjectId: string;
        assessmentType: AssessmentType;
        assessmentNo: number;
        marks: { studentId: string; marksObtained: number }[];
    }
) => {
    const campusId = await resolveCampusId(userId, role);

    // Verify subject belongs to this campus
    const subject = await prisma.subject.findFirst({
        where: { id: payload.subjectId, campusDepartment: { campusId } },
    });
    if (!subject) throw new AppError(status.NOT_FOUND as number, "Subject not found in your campus");

    // Verify all students belong to this campus
    const studentIds = payload.marks.map((m) => m.studentId);
    const students = await prisma.student.findMany({
        where: { id: { in: studentIds }, campusDepartment: { campusId } },
    });
    if (students.length !== studentIds.length) {
        throw new AppError(status.BAD_REQUEST as number, "One or more students not found in your campus");
    }

    // Bulk upsert using transaction
    const results = await prisma.$transaction(
        payload.marks.map((m) =>
            prisma.mark.upsert({
                where: {
                    studentId_subjectId_assessmentType_assessmentNo: {
                        studentId: m.studentId,
                        subjectId: payload.subjectId,
                        assessmentType: payload.assessmentType,
                        assessmentNo: payload.assessmentNo,
                    },
                },
                update: { marksObtained: m.marksObtained, submittedById: userId },
                create: {
                    studentId: m.studentId,
                    subjectId: payload.subjectId,
                    campusDepartmentId: subject.campusDepartmentId,
                    assessmentType: payload.assessmentType,
                    assessmentNo: payload.assessmentNo,
                    marksObtained: m.marksObtained,
                    submittedById: userId,
                },
                include: markInclude,
            })
        )
    );

    return results;
};

export const markService = { getMarks, bulkUpsertMarks };

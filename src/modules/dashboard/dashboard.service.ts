import { prisma } from "../../lib/prisma.js";
import { UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";

// ─── helpers ────────────────────────────────────────────────────────────────

const getPrincipalCampus = async (userId: string) => {
    const campus = await prisma.campus.findUnique({
        where: { principalId: userId },
        include: { departments: { include: { department: true } } },
    });
    return campus; // null if payment not completed yet
};

const getTeacherCampusDept = async (userId: string) => {
    const teacher = await prisma.teacher.findFirst({
        where: { userId },
        include: { campusDepartment: { include: { department: true, campus: true } } },
    });
    if (!teacher) throw new AppError(status.NOT_FOUND as number, "No campus department found for this user");
    return teacher;
};

// ─── PRINCIPAL dashboard ─────────────────────────────────────────────────────

const getPrincipalDashboard = async (userId: string) => {
    const campus = await getPrincipalCampus(userId);

    // campus not created yet — payment pending
    if (!campus) {
        const registration = await prisma.campusRegistration.findFirst({
            where: { createdById: userId },
        });
        return {
            pendingPayment: true,
            registration: registration ? {
                campusName: registration.campusName,
                campusCode: registration.campusCode,
                amount: registration.amount,
                expiresAt: registration.expiresAt,
            } : null,
        };
    }

    const campusId = campus.id;

    const [departments, teachers, students, pendingMarks] = await Promise.all([
        prisma.campusDepartment.count({ where: { campusId } }),
        prisma.teacher.count({ where: { campusDepartment: { campusId } } }),
        prisma.student.count({ where: { campusDepartment: { campusId } } }),
        prisma.mark.count({ where: { campusDepartment: { campusId }, status: "PENDING" } }),
    ]);

    const departmentBreakdown = await prisma.campusDepartment.findMany({
        where: { campusId },
        include: {
            department: true,
            hod: { select: { id: true, name: true, email: true } },
            _count: { select: { teachers: true, students: true } },
        },
    });

    return {
        campus: { id: campus.id, name: campus.campusName, code: campus.campusCode, address: campus.address },
        stats: { departments, teachers, students, pendingMarks },
        departmentBreakdown,
    };
};

// ─── HOD dashboard ───────────────────────────────────────────────────────────

const getHODDashboard = async (userId: string) => {
    const campusDept = await prisma.campusDepartment.findFirst({
        where: { hodId: userId },
        include: { department: true, campus: true },
    });
    if (!campusDept) throw new AppError(status.NOT_FOUND as number, "No department found for this HOD");

    const campusDepartmentId = campusDept.id;

    const [teachers, students, subjects, pendingMarks] = await Promise.all([
        prisma.teacher.count({ where: { campusDepartmentId } }),
        prisma.student.count({ where: { campusDepartmentId } }),
        prisma.subject.count({ where: { campusDepartmentId } }),
        prisma.mark.count({ where: { campusDepartmentId, status: "PENDING" } }),
    ]);

    const semesterBreakdown = await prisma.student.groupBy({
        by: ["semester"],
        where: { campusDepartmentId },
        _count: { id: true },
        orderBy: { semester: "asc" },
    });

    return {
        campus: { id: campusDept.campus.id, name: campusDept.campus.campusName },
        department: { id: campusDept.department.id, name: campusDept.department.name, shortName: campusDept.department.shortName },
        stats: { teachers, students, subjects, pendingMarks },
        semesterBreakdown: semesterBreakdown.map((s) => ({ semester: s.semester, students: s._count.id })),
    };
};

// ─── TEACHER dashboard ───────────────────────────────────────────────────────

const getTeacherDashboard = async (userId: string) => {
    const teacher = await getTeacherCampusDept(userId);
    const campusDepartmentId = teacher.campusDepartmentId;

    const [students, subjects, submittedMarks, pendingMarks] = await Promise.all([
        prisma.student.count({ where: { campusDepartmentId } }),
        prisma.subject.count({ where: { campusDepartmentId } }),
        prisma.mark.count({ where: { campusDepartmentId, submittedById: userId } }),
        prisma.mark.count({ where: { campusDepartmentId, submittedById: userId, status: "PENDING" } }),
    ]);

    return {
        campus: { id: teacher.campusDepartment.campus.id, name: teacher.campusDepartment.campus.campusName },
        department: { id: teacher.campusDepartment.department.id, name: teacher.campusDepartment.department.name },
        teacher: { id: teacher.id, employeeId: teacher.employeeId, designation: teacher.designation },
        stats: { students, subjects, submittedMarks, pendingMarks },
    };
};

// ─── STUDENT dashboard ───────────────────────────────────────────────────────

const getStudentDashboard = async (userId: string) => {
    const student = await prisma.student.findFirst({
        where: { userId },
        include: { campusDepartment: { include: { department: true, campus: true } } },
    });
    if (!student) throw new AppError(status.NOT_FOUND as number, "No student record found");

    const marks = await prisma.mark.findMany({
        where: { studentId: student.id },
        include: { subject: { select: { id: true, name: true, code: true, maxMarks: true } } },
        orderBy: { submittedAt: "desc" },
    });

    const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = marks.reduce((sum, m) => sum + m.subject.maxMarks, 0);
    const percentage = totalMax > 0 ? parseFloat(((totalMarks / totalMax) * 100).toFixed(2)) : 0;

    return {
        campus: { id: student.campusDepartment.campus.id, name: student.campusDepartment.campus.campusName },
        department: { id: student.campusDepartment.department.id, name: student.campusDepartment.department.name },
        student: { id: student.id, roll: student.roll, session: student.session, semester: student.semester, shift: student.shift },
        stats: { totalAssessments: marks.length, totalMarks, totalMax, percentage },
        marks,
    };
};

// ─── dispatcher ─────────────────────────────────────────────────────────────

export const getDashboard = async (userId: string, role: UserRole) => {
    switch (role) {
        case UserRole.PRINCIPAL: return getPrincipalDashboard(userId);
        case UserRole.HOD:       return getHODDashboard(userId);
        case UserRole.TEACHER:   return getTeacherDashboard(userId);
        case UserRole.STUDENT:   return getStudentDashboard(userId);
        default: throw new AppError(status.FORBIDDEN as number, "No dashboard available for this role");
    }
};

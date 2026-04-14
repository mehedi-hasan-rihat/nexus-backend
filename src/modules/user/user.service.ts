import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import { IAddUserPayload } from "./user.interface.js";
import status from "http-status";

const addUser = async (payload: IAddUserPayload, requesterId: string, requesterRole: UserRole) => {
    const { name, email, password, role, campusDepartmentId, ...profile } = payload;

    // Permission matrix
    const allowed: Record<string, UserRole[]> = {
        [UserRole.PRINCIPAL]: [UserRole.HOD, UserRole.TEACHER],
        [UserRole.HOD]: [UserRole.TEACHER, UserRole.STUDENT],
        [UserRole.TEACHER]: [UserRole.STUDENT],
    };

    if (!allowed[requesterRole]?.includes(role)) {
        throw new AppError(status.FORBIDDEN as number, `${requesterRole} cannot add ${role}`);
    }

    if (role === UserRole.STUDENT) {
        const { roll, session, semester, shift } = profile;
        if (!roll || !session || !semester || !shift) {
            throw new AppError(status.BAD_REQUEST as number, "roll, session, semester and shift are required for student");
        }
    }

    const registered = await auth.api.signUpEmail({ body: { name, email, password } });
    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create user");

    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: registered.user.id },
                data: { role, isActive: true },
            });

            if (role === UserRole.STUDENT) {
                const student = await tx.student.create({
                    data: {
                        userId: user.id,
                        campusDepartmentId,
                        roll: profile.roll!,
                        session: profile.session!,
                        semester: profile.semester!,
                        shift: profile.shift!,
                    },
                });
                return { user, student };
            } else {
                // HOD or TEACHER
                const teacher = await tx.teacher.create({
                    data: {
                        userId: user.id,
                        campusDepartmentId,
                        employeeId: profile.employeeId,
                        designation: profile.designation,
                        qualification: profile.qualification,
                    },
                });
                return { user, teacher };
            }
        });

        return result;
    } catch (error) {
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

export const userService = { addUser };

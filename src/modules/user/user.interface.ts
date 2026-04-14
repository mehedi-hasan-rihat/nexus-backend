import { Shift, UserRole } from "../../generated/prisma/enums.js";

export interface IAddUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole.HOD | UserRole.TEACHER | UserRole.STUDENT;
    campusDepartmentId: string;
    // Teacher / HOD fields
    employeeId?: string;
    designation?: string;
    qualification?: string;
    // Student fields
    roll?: string;
    session?: string;
    semester?: number;
    shift?: Shift;
}

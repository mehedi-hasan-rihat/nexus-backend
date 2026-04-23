import { Shift } from "../../generated/prisma/enums.js";

export interface IAddUserPayload {
    name: string;
    email: string;
    password: string;
    role: "HOD" | "TEACHER" | "STUDENT";
    campusDepartmentId: string;
    employeeId?: string;
    designation?: string;
    qualification?: string;
    roll?: string;
    session?: string;
    semester?: number;
    shift?: Shift;
}

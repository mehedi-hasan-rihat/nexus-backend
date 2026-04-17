import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import { ICreateCampusPayload } from "./campus.interface.js";
import status from "http-status";

const createCampus = async (payload: ICreateCampusPayload) => {
    const { campusName, campusCode, address, principal } = payload;

    const registered = await auth.api.signUpEmail({
        body: {
            name: principal.name,
            email: principal.email,
            password: principal.password,
        },
    });

    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create principal user");

    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: registered.user.id },
                data: { role: UserRole.PRINCIPAL, isActive: true },
            });

            const campus = await tx.campus.create({
                data: { campusName, campusCode, address, principalId: registered.user.id },
            });

            return { campus, principal: registered.user };
        });

        return result;
    } catch (error) {
        // rollback: delete the created user if transaction fails
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

export const campusService = { createCampus };

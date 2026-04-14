import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole } from "../generated/prisma/enums";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: UserRole.STUDENT
            },

            isActive: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            phone: {
                type: "string",
                required: false,
            },

            address: {
                type: "string",
                required: false,
            }

        }
    },

});
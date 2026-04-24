import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { UserRole } from "../generated/prisma/enums.js";
import { envVars } from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";
import { prisma } from "../lib/prisma.js";
import { jwtUtils } from "../utils/jwt.js";

export const checkAuth = (...authRoles: UserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : null;

        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED as number, "Unauthorized access! No session token provided.");
        }

        const sessionExists = await prisma.session.findFirst({
            where: {
                token: sessionToken,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!sessionExists?.user) {
            throw new AppError(status.UNAUTHORIZED as number, "Unauthorized access! Invalid or expired session.");
        }

        const user = sessionExists.user;

        const sessionLifeTime = sessionExists.expiresAt.getTime() - sessionExists.createdAt.getTime();
        const timeRemaining = sessionExists.expiresAt.getTime() - Date.now();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", sessionExists.expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());
        }

        if (!user.isActive) {
            throw new AppError(status.UNAUTHORIZED as number, "Unauthorized access! User is not active.");
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role as UserRole)) {
            throw new AppError(status.FORBIDDEN as number, "Forbidden! You do not have permission to access this resource.");
        }

        const accessToken = req.headers["x-access-token"] as string | undefined;

        if (!accessToken) {
            throw new AppError(status.UNAUTHORIZED as number, "Unauthorized access! No access token provided.");
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success) {
            throw new AppError(status.UNAUTHORIZED as number, "Unauthorized access! Invalid access token.");
        }

        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as UserRole)) {
            throw new AppError(status.FORBIDDEN as number, "Forbidden! You do not have permission to access this resource.");
        }

        req.user = {
            userId: user.id,
            role: user.role as UserRole,
            email: user.email,
        };

        next();
    } catch (error: any) {
        next(error);
    }
};

import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { UserRole } from "../generated/prisma/enums.js";
import AppError from "../errorHelpers/AppError.js";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    console.log("Session:", session);
    if (!session) throw new AppError(401, "Unauthorized");
    req.user = session.user as Express.Request["user"];
    next();
};

export const requireRole = (...roles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role as UserRole)) {
            throw new AppError(403, "Forbidden");
        }
        next();
    };

import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { addUser } from "./user.controller.js";
import { UserRole } from "../../generated/prisma/enums.js";

const router = Router();

router.post(
    "/",
    requireAuth,
    requireRole(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER),
    addUser
);

export default router;

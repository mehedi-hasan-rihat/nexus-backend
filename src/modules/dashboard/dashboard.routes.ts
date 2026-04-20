import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { dashboard } from "./dashboard.controller.js";

const router = Router();

router.get(
    "/",
    checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT),
    dashboard
);

export default router;

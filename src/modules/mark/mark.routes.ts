import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { getMarks, bulkUpsertMarks } from "./mark.controller.js";

const router = Router();

router.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT), getMarks);
router.post("/bulk", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), bulkUpsertMarks);

export default router;

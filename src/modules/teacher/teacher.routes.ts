import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { createTeacher, getTeachers, updateTeacher, deleteTeacher } from "./teacher.controller.js";

const router = Router();

router.post("/", checkAuth(UserRole.PRINCIPAL), createTeacher);
router.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), getTeachers);
router.patch("/:id", checkAuth(UserRole.PRINCIPAL), updateTeacher);
router.delete("/:id", checkAuth(UserRole.PRINCIPAL), deleteTeacher);

export default router;

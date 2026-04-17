import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { createStudent, getStudents, updateStudent, deleteStudent } from "./student.controller.js";

const router = Router();

router.post("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), createStudent);
router.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), getStudents);
router.patch("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), updateStudent);
router.delete("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), deleteStudent);

export default router;

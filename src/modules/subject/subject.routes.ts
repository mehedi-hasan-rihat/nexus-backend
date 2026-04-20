import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { createSubject, getSubjects, updateSubject, deleteSubject } from "./subject.controller.js";

const router = Router();

router.post("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), createSubject);
router.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT), getSubjects);
router.patch("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), updateSubject);
router.delete("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), deleteSubject);

export default router;

import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import {
    addDepartmentToCampus,
    getCampusDepartments,
    removeDepartmentFromCampus,
    assignHOD,
    changeHOD,
    removeHOD,
} from "./department.controller.js";

const router = Router();

router.post("/", checkAuth(UserRole.PRINCIPAL), addDepartmentToCampus);
router.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), getCampusDepartments);
router.delete("/:id", checkAuth(UserRole.PRINCIPAL), removeDepartmentFromCampus);

router.post("/:id/hod", checkAuth(UserRole.PRINCIPAL), assignHOD);
router.patch("/:id/hod", checkAuth(UserRole.PRINCIPAL), changeHOD);
router.delete("/:id/hod", checkAuth(UserRole.PRINCIPAL), removeHOD);

export default router;

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
} from "../department/department.controller.js";
import {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher,
} from "../teacher/teacher.controller.js";

const router = Router();

router.use(checkAuth(UserRole.PRINCIPAL));

// Departments
router.post("/departments", addDepartmentToCampus);
router.get("/departments", getCampusDepartments);
router.delete("/departments/:id", removeDepartmentFromCampus);

// HOD management
router.post("/departments/:id/hod", assignHOD);
router.patch("/departments/:id/hod", changeHOD);
router.delete("/departments/:id/hod", removeHOD);

// Teachers
router.post("/teachers", createTeacher);
router.get("/teachers", getTeachers);
router.patch("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

export default router;

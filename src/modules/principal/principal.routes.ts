import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import { UserRole } from "../../generated/prisma/enums.js";
import {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
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

router.use(requireAuth, requireRole(UserRole.PRINCIPAL));

// Departments
router.post("/departments", createDepartment);
router.get("/departments", getDepartments);
router.patch("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// HOD management
router.post("/departments/:id/hod", assignHOD);    // create new user as HOD
router.patch("/departments/:id/hod", changeHOD);   // assign existing user as HOD
router.delete("/departments/:id/hod", removeHOD);  // remove HOD from department

// Teachers
router.post("/teachers", createTeacher);
router.get("/teachers", getTeachers);
router.patch("/teachers/:id", updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

export default router;

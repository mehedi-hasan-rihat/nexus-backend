import { Router } from "express";
import departmentRoutes from "../department/department.routes.js";
import teacherRoutes from "../teacher/teacher.routes.js";
import studentRoutes from "../student/student.routes.js";

const router = Router();

router.use("/departments", departmentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);

export default router;

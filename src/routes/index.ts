import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import campusRoutes from "../modules/campus/campus.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import departmentRoutes from "../modules/department/department.routes.js";
import teacherRoutes from "../modules/teacher/teacher.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import subjectRoutes from "../modules/subject/subject.routes.js";
import markRoutes from "../modules/mark/mark.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campus", campusRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/subjects", subjectRoutes);
router.use("/marks", markRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;

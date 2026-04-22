import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import campusRoutes from "../modules/campus/campus.routes.js";
import principalRoutes from "../modules/principal/principal.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import subjectRoutes from "../modules/subject/subject.routes.js";
import markRoutes from "../modules/mark/mark.routes.js";
import { getAllDepartments, createDepartment, createDepartmentsBulk } from "../modules/department/department.controller.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campus", campusRoutes);
router.use("/principal", principalRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);
router.use("/marks", markRoutes);
router.use("/dashboard", dashboardRoutes);

// global department list (public)
router.get("/departments", getAllDepartments);
router.post("/departments", createDepartment);
router.post("/departments/bulk", createDepartmentsBulk);

export default router;

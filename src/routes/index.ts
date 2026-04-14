import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import campusRoutes from "../modules/campus/campus.routes.js";
import userRoutes from "../modules/user/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campus", campusRoutes);
router.use("/users", userRoutes);

export default router;

import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import campusRoutes from "../modules/campus/campus.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import principalRoutes from "../modules/principal/principal.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/campus", campusRoutes);
router.use("/users", userRoutes);
router.use("/principal", principalRoutes);

export default router;

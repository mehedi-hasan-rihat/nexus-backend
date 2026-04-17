import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { addUser } from "./user.controller.js";
import { UserRole } from "../../generated/prisma/enums.js";

const router = Router();

router.post("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), addUser);

export default router;

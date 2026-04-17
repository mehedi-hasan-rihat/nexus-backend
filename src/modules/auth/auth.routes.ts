import { Router } from "express";
import { login, logout, getMe } from "./auth.controller.js";
import { checkAuth } from "../../middleware/checkAuth.js";

const router = Router();

router.post("/login", login);
router.post("/logout", checkAuth(), logout);
router.get("/me", checkAuth(), getMe);

export default router;

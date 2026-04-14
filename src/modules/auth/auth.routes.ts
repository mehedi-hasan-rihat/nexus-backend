import { Router } from "express";
import { register, login, logout, getMe } from "./auth.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

// will add register route later when we have a better registration flow in place (currently only admin can add users)
// router.post("/register", register);

router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);

export default router;

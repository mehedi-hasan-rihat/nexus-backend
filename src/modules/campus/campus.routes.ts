import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { createCampus } from "./campus.controller.js";

const router = Router();

router.post("/", requireAuth, createCampus);

export default router;

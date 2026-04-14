import { Router } from "express";
import { createCampus } from "./campus.controller.js";

const router = Router();

router.post("/", createCampus);

export default router;

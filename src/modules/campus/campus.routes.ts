import { Router } from "express";
import { initiateCampusRegistration } from "./campus.controller.js";

const router = Router();

router.post("/initiate", initiateCampusRegistration);

export default router;

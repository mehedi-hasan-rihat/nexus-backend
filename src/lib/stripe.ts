import Stripe from "stripe";
import { envVars } from "../config/env.js";

if (!envVars.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

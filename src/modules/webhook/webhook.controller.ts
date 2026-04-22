import { Request, Response } from "express";
import { stripe } from "../../lib/stripe.js";
import { envVars } from "../../config/env.js";
import { webhookService } from "./webhook.service.js";

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, envVars.STRIPE_WEBHOOK_SECRET);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Webhook signature verification failed";
        console.error(`Webhook signature error: ${message}`);
        res.status(400).send(`Webhook Error: ${message}`);
        return;
    }

    try {
        const result = await webhookService.handleStripeWebhookEvent(event);
        res.json(result);
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};

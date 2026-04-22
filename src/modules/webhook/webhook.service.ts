import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { campusService } from "../campus/campus.service.js";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    const existing = await prisma.payment.findFirst({ where: { stripeEventId: event.id } });
    if (existing) {
        console.log(`Event ${event.id} already processed. Skipping.`);
        return { message: `Event ${event.id} already processed.` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const registrationId = session.metadata?.registrationId;

            if (!registrationId) {
                console.error("Missing registrationId in session metadata");
                return { message: "Missing registrationId in metadata" };
            }

            await campusService.fulfillCampusRegistration(registrationId, event.id, session as object);
            console.log(`Campus created for registration ${registrationId}`);
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const registrationId = session.metadata?.registrationId;

            if (registrationId) {
                const registration = await prisma.campusRegistration.findUnique({ where: { id: registrationId } });
                if (registration) {
                    await prisma.user.delete({ where: { id: registration.createdById } }).catch(() => null);
                    await prisma.campusRegistration.delete({ where: { id: registrationId } }).catch(() => null);
                    console.log(`Registration ${registrationId} expired — user and registration cleaned up.`);
                }
            }
            break;
        }

        case "payment_intent.payment_failed": {
            const intent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment intent ${intent.id} failed.`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook event ${event.id} processed successfully` };
};

export const webhookService = { handleStripeWebhookEvent };

import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { stripe } from "../../lib/stripe.js";
import { envVars } from "../../config/env.js";
import { PaymentStatus, UserRole } from "../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import { ICreateCampusPayload } from "./campus.interface.js";
import status from "http-status";

const initiateCampusRegistration = async (payload: ICreateCampusPayload) => {
    const { campusName, campusCode, address, principal } = payload;

    const existing = await prisma.campus.findUnique({ where: { campusCode } });
    if (existing) throw new AppError(status.CONFLICT as number, "Campus code already exists");

    // step 1: register principal user, activate and assign PRINCIPAL role immediately
    const registered = await auth.api.signUpEmail({
        body: { name: principal.name, email: principal.email, password: principal.password },
    });
    if (!registered.user) throw new AppError(status.BAD_REQUEST as number, "Failed to create principal user");

    await prisma.user.update({
        where: { id: registered.user.id },
        data: { isActive: true, role: UserRole.PRINCIPAL },
    });
    const amount = envVars.CAMPUS_REGISTRATION_FEE;

    try {
        // step 2: save pending registration with createdById = principal user id
        const registration = await prisma.campusRegistration.create({
            data: {
                campusName,
                campusCode,
                address,
                createdById: registered.user.id,
                principalName: principal.name,
                principalEmail: principal.email,
                principalPassword: principal.password,
                amount,
                expiresAt: new Date(Date.now() + 1000 * 60 * 30),
            },
        });

        // step 3: create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    unit_amount: amount * 100,
                    product_data: { name: `Campus Registration — ${campusName}` },
                },
                quantity: 1,
            }],
            metadata: { registrationId: registration.id },
            success_url: `${envVars.CLIENT_URL}/campus/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${envVars.CLIENT_URL}/campus/cancel`,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
        });

        await prisma.campusRegistration.update({
            where: { id: registration.id },
            data: { stripeSessionId: session.id },
        });

        return { checkoutUrl: session.url, registrationId: registration.id };
    } catch (error) {
        await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
        throw error;
    }
};

// called by webhook after successful payment
const fulfillCampusRegistration = async (registrationId: string, stripeEventId: string, stripeSessionData: object) => {
    const registration = await prisma.campusRegistration.findUnique({ where: { id: registrationId } });
    if (!registration) throw new Error(`Registration ${registrationId} not found`);

    // principal user already exists (created in initiate step), just promote + create campus
    await prisma.$transaction(async (tx) => {
        const campus = await tx.campus.create({
            data: {
                campusName: registration.campusName,
                campusCode: registration.campusCode,
                address: registration.address ?? undefined,
                principalId: registration.createdById,
            },
        });

        await tx.payment.create({
            data: {
                amount: registration.amount,
                transactionId: registration.stripeSessionId!,
                stripeEventId,
                status: PaymentStatus.PAID,
                paymentGatewayData: stripeSessionData,
                campusId: campus.id,
                registrationId: registration.id,
            },
        });

        await tx.campusRegistration.delete({ where: { id: registrationId } });
    });
};

export const campusService = { initiateCampusRegistration, fulfillCampusRegistration };

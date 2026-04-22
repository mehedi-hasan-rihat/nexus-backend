import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { stripeWebhook } from "./modules/webhook/webhook.controller.js";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

app.use(cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser());

// Stripe webhook needs raw body — must be before express.json()
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(morgan("dev"));

// better-auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript + Express!');
});

app.use(globalErrorHandler);

export default app;
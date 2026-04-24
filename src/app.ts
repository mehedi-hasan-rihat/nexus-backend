import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { stripeWebhook } from "./modules/webhook/webhook.controller.js";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

const ALLOWED_ORIGINS = (
    process.env.CLIENT_URL ?? "http://localhost:3000"
).split(",").map((o) => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

// Stripe webhook needs raw body — must be before express.json()
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(morgan("dev"));

// global request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`→ ${req.method} ${req.path}`, Object.keys(req.body || {}).length ? req.body : '');
    next();
});

// better-auth handler — must be before /api routes


app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello, TypeScript + Express!');
});

app.use(globalErrorHandler);

export default app;
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

app.use(cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use('/api', routes);

app.use('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    // Handle Stripe webhook events here
    // You can verify the event using Stripe's signature and process it accordingly
    console.log('Received Stripe webhook event:', req.body);
    res.status(200).send('Webhook received');
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript + Express!');
});

app.use(globalErrorHandler);

export default app;
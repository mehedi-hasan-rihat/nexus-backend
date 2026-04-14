import express, { Application, Request, Response } from "express";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

const app: Application = express();

// Middleware to parse JSON bodies
app.use(express.json());

// API routes
app.use('/api', routes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

// Error handler (must be last)
app.use(globalErrorHandler);

export default app;
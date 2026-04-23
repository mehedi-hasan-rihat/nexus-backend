import "dotenv/config";

export const envVars = {
    NODE_ENV: process.env.NODE_ENV ?? "production",
    PORT: process.env.PORT ?? "5000",
    DATABASE_URL: process.env.DATABASE_URL!,
    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    CAMPUS_REGISTRATION_FEE: Number(process.env.CAMPUS_REGISTRATION_FEE ?? 5000),
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? "access_secret",
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1d",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? "refresh_secret",
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
}

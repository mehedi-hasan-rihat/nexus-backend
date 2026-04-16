import status from "http-status";
import { auth } from "../../lib/auth.js";
import AppError from "../../errorHelpers/AppError.js";
import { ILoginPayload, IRegisterPayload } from "./auth.interface.js";

const register = async (payload: IRegisterPayload) => {
    const data = await auth.api.signUpEmail({ body: payload });

    if (!data.user) throw new AppError(status.BAD_REQUEST as number, "Registration failed");

    return data.user;
};

const login = async (payload: ILoginPayload) => {
    const data = await auth.api.signInEmail({ body: payload });

    if (!data.user) throw new AppError(status.UNAUTHORIZED as number, "Invalid credentials");

    return { user: data.user, token: data.token };
};

export const authService = { register, login };

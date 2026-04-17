import status from "http-status";
import { auth } from "../../lib/auth.js";
import AppError from "../../errorHelpers/AppError.js";
import { tokenUtils } from "../../utils/token.js";
import { ILoginPayload, IRegisterPayload } from "./auth.interface.js";

const register = async (payload: IRegisterPayload) => {
    const data = await auth.api.signUpEmail({ body: payload });

    if (!data.user) throw new AppError(status.BAD_REQUEST as number, "Registration failed");

    return data.user;
};

const login = async (payload: ILoginPayload) => {
    const data = await auth.api.signInEmail({ body: payload });

    if (!data.user) throw new AppError(status.UNAUTHORIZED as number, "Invalid credentials");

    const jwtPayload = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
    };

    const accessToken = tokenUtils.getAccessToken(jwtPayload);
    const refreshToken = tokenUtils.getRefreshToken(jwtPayload);

    return { user: data.user, sessionToken: data.token, accessToken, refreshToken };
};

export const authService = { register, login };

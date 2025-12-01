/* Zod validation schemas for auth routes */

import z from "zod";

export const registerParser = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterInput = z.infer<typeof registerParser>;

export const verifyParser = z.object({
    otp: z.string().min(6, "OTP is required"),
    email: z.string().email("Invalid email"),
});
export type VerifyInput = z.infer<typeof verifyParser>;

export const forgotParser = z.object({
    email: z.string().email("Invalid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotParser>;

export const loginParser = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginParser>;

export const logoutParser = z.object({
    token: z.string().min(1, "Token is required"),
});
export type LogoutInput = z.infer<typeof logoutParser>;

/* AuthService: Handles authentication business logic */

import bcrypt from "bcryptjs";
import sendMail from "../utils/sendMail";
import { redisClient } from "../lib/redis";
import { generateOTP } from "../utils/gen-otp";
import { generateToken } from "../utils/gen-token";

import { RegisterInput } from "../validations/auth.validations";
import { userRepository } from "../repo/user.repo";
import { Request, Response } from "express";
import { ResponseHandler } from "../../../../packages/utils";

export class AuthService {

    /* REGISTER */
    async registerUser(
        { email, password }: RegisterInput,
        req: Request,
        res: Response
    ) {
        // validate
        if (!email || !password)
            return ResponseHandler.badRequest(res, "Email and password required");

        // exists check
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser)
            return ResponseHandler.conflict(res, "User already exists");

        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const newUser = await userRepository.create({
            email,
            password: hashedPassword,
        });

        // gen otp + token
        const otp = generateOTP(6);
        newUser.tokenVerification = generateToken({ id: newUser._id }, "15m");
        newUser.expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await Promise.all([
            newUser.save(),
            redisClient.setex(`verify_${newUser._id}`, 900, otp),
            sendMail(email, "Verify your email", `Your OTP: ${otp}`, otp),
        ]);

        return ResponseHandler.success(res, { userId: newUser._id }, "Registered successfully");
    }

    /* VERIFY EMAIL */
    async verifyEmail(otp: string, email: string, req: Request, res: Response) {
        // user find
        const user = await userRepository.findByEmail(email);
        if (!user) return ResponseHandler.badRequest(res, "Invalid OTP or email");

        // otp check
        const storedOtp = await redisClient.get(`verify_${user._id}`);
        console.log(storedOtp, otp)
        if (!storedOtp || storedOtp.toString() !== otp.toString()) {
            return ResponseHandler.unauthorized(res, "Invalid or expired OTP");
        }


        // verify
        user.isVerified = true;
        user.tokenVerification = undefined;

        await Promise.all([
            user.save(),
            redisClient.del(`verify_${user._id}`),
        ]);

        return ResponseHandler.success(res, {}, "Email verified successfully");
    }

    /* FORGOT PASSWORD */
    async forgotPassword(email: string, req: Request, res: Response) {
        // otp gen
        const otp = generateOTP(6);

        await Promise.all([
            redisClient.setex(`forgot_${email}`, 900, otp),
            sendMail(email, "Reset Password", `Your OTP: ${otp}`, otp),
        ]);

        return ResponseHandler.success(res, {}, "OTP sent to email");
    }

    /* LOGOUT */
    async logoutUser(token: string, req: Request, res: Response) {
        // redis scan
        const keys = await redisClient.keys("session_*");

        for (const key of keys) {
            const storedToken = await redisClient.get(key);

            if (storedToken === token) {
                await redisClient.del(key);

                // cookie clear
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");

                return ResponseHandler.success(res, {}, "Logged out successfully");
            }
        }

        return ResponseHandler.notFound(res, "Session not found");
    }

    // me

    async me(userId: string, req: Request, res: Response) {
        try {
            console.log(userId)
            if (!userId)
                return ResponseHandler.unauthorized(res, "Not authenticated");
            const user = await userRepository.findById(userId);

            if (!user)
                return ResponseHandler.notFound(res, "User not found");

            // remove sensitive fields manually
            const safeUser = {
                id: user._id,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return ResponseHandler.success(res, safeUser, "User fetched");
        } catch (err: any) {
            return ResponseHandler.serverError(res, err.message);
        }
    }
}

export default new AuthService();

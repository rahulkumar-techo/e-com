/* AuthService: Handles business logic and DB operations */

import { redisClient } from "../lib/redis";
import { generateOTP } from "../utils/gen-otp";
import sendMail from "../utils/sendMail";
import { LoginInput, RegisterInput } from "../validations/auth.validations";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/gen-token";
import { userRepository } from "../repo/user.repo";

class AuthService {

    /* REGISTER */
    async registerUser({ email, password }: RegisterInput) {
        if (!email || !password) throw new Error("Email and password are required");

        const exists = await userRepository.findByEmail(email);
        if (exists) throw new Error("User already exists");

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await userRepository.create({ email, password: hashed });
        const otp = generateOTP(6);

        newUser.tokenVerification = generateToken({ id: newUser._id }, "15m");

        await Promise.all([
            newUser.save(),
            redisClient.setex(`verify_${newUser._id}`, 900, otp),
            sendMail(email, "Verify your email", `Your OTP: ${otp}`, otp)
        ]);

        return { msg: "Registered successfully", userId: newUser._id };
    }

    /* VERIFY EMAIL */
    async verifyEmail(otp: string, email: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error("Invalid OTP or email");

        const storedOtp = await redisClient.get(`verify_${user._id}`);
        if (!storedOtp || storedOtp !== otp) throw new Error("Invalid or expired OTP");

        user.isVerified = true;
        user.tokenVerification = undefined;

        await Promise.all([
            user.save(),
            redisClient.del(`verify_${user._id}`)
        ]);

        return { msg: "Email verified successfully" };
    }

    /* FORGOT PASSWORD */
    async forgotPassword(email: string) {
        const otp = generateOTP(6);

        await Promise.all([
            redisClient.setex(`forgot_${email}`, 900, otp),
            sendMail(email, "Reset Password", `Your OTP: ${otp}`, otp)
        ]);

        return { msg: "OTP sent to email" };
    }

    /* LOGIN */
    async loginUser({ email, password }: LoginInput) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        const match = await bcrypt.compare(password, user.password || "");
        if (!match) throw new Error("Invalid credentials");

        if (!user.isVerified) throw new Error("Email not verified");

        const token = generateToken({ id: user._id }, "1h");

        await redisClient.setex(`session_${user._id}`, 3600, token);

        return { msg: "Login successful", token };
    }

    /* LOGOUT */
    async logoutUser(token: string) {
        // scan for the session containing the token
        const keys = await redisClient.keys("session_*");

        for (const key of keys) {
            const stored = await redisClient.get(key);
            if (stored === token) {
                await redisClient.del(key);
                return { msg: "Logged out successfully" };
            }
        }

        throw new Error("Session not found");
    }
}

export default new AuthService();

/* loginAuth.service.ts — Login Module */

import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { userRepository } from "../repo/user.repo";
import { Session, SessionCreateInput } from "../models/session.model";
import { redisClient } from "../lib/redis";
import { authLogger } from "../config/logger";
import { normalizeHeader } from "../utils/normalize";
import { generateTokens } from "../utils/generateTokens";
import {
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from "../utils/cookieOptions";
import { ResponseHandler } from "../../../../packages/utils";

export class LoginAuthService {

    async login(
        { email, password }: { email: string; password: string },
        req: Request,
        res: Response
    ) {
        // find user with hidden fields
        const user = await userRepository.findWithHiddenFields(email);
        if (!user)
            return ResponseHandler.unauthorized(res, "Invalid credentials");

        // blocked check
        if (user.isBlocked)
            return ResponseHandler.forbidden(res, "User is blocked");

        // match password
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch)
            return ResponseHandler.unauthorized(res, "Invalid credentials");

        // verified check
        if (!user.isVerified)
            return ResponseHandler.unauthorized(res, "Email not verified");

        // metadata
        const device = normalizeHeader(req.headers["x-device-name"], "Unknown Device");
        const ip = normalizeHeader(req.ip, "Unknown IP");
        const userAgent = normalizeHeader(req.headers["user-agent"], "Unknown");

        // remove old sessions in DB
        await Session.deleteMany({ userId: user._id });

        // remove old access token in Redis
        await redisClient.del(`session_${user._id}`);

        // generate tokens
        const { accessToken, refreshToken, hashedRT } = await generateTokens({ id: user._id });

        // save session
        const sessionData: SessionCreateInput = {
            userId: user._id,
            refreshToken: hashedRT,
            device,
            ip,
            userAgent,
            lastUsed: new Date(),
        };
        await Session.create(sessionData);

        // save access token in redis
        await redisClient.setex(`session_${user._id}`, 3600, accessToken);

        // set cookies
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        // set header
        res.setHeader("Authorization", `Bearer ${accessToken}`);

        // log activity
        authLogger.info("login", { userId: user._id, device, ip, userAgent });

        // final response
        return ResponseHandler.success(
            res,
            { accessToken, device },
            "Login successful"
        );
    }
}

export const loginAuth = new LoginAuthService();

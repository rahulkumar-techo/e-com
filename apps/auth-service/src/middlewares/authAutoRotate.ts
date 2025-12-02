// Auto-verify + Auto-rotate + Continue route

import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

import { generateTokens } from "../utils/generateTokens";
import {
    accessTokenCookieOptions,
    refreshTokenCookieOptions,
} from "../utils/cookieOptions";

import { ResponseHandler } from "../../../../packages/utils";
import { Session } from "../models/session.model";
import { authLogger } from "../config/logger";

export const authAutoRotate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const storedRefreshToken = req.cookies.refreshToken;

        if (!storedRefreshToken) {
            return ResponseHandler.error(res, 401, "Refresh token missing");
        }

        // decode refresh token
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(
                storedRefreshToken,
                process.env.REFRESH_TOKEN_SECRET!
            ) as JwtPayload;
        } catch {
            return ResponseHandler.error(res, 403, "Invalid or expired refresh token");
        }

        const userId = decoded?.id;
        if (!userId)
            return ResponseHandler.error(res, 400, "Malformed refresh token");

        // find session
        const session = await Session.findOne({ userId });
        if (!session) {
            authLogger.warn("TOKEN REUSE DETECTED", {
                userId,
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            });

            return ResponseHandler.error(res, 403, "Token reuse detected");
        }

        // hashed check
        const isValid = await bcrypt.compare(storedRefreshToken, session.refreshToken);
        if (!isValid) {
            authLogger.warn("TOKEN REUSE ATTACK", {
                userId,
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            });

            await Session.deleteOne({ _id: session._id });
            return ResponseHandler.error(
                res,
                403,
                "Security alert: invalid refresh token removed"
            );
        }

        // rotate tokens
        const {
            accessToken: newAT,
            refreshToken: newRT,
            hashedRT,
        } = await generateTokens({ id: userId });

        // update session
        session.refreshToken = hashedRT;
        session.lastUsed = new Date();
        await session.save();

        authLogger.info("Refresh token rotated", {
            userId,
            device: session.device,
            ip: req.ip,
        });

        // set cookies + header
        res.cookie("accessToken", newAT, accessTokenCookieOptions);
        res.cookie("refreshToken", newRT, refreshTokenCookieOptions);
        res.setHeader("Authorization", `Bearer ${newAT}`);

        // ⭐ MAIN FIX: set req.user for downstream routes
        req.user = { id: userId };

        // ⭐ MAIN FIX: allow route execution
        return next();

    } catch (error: any) {
        authLogger.error("ROTATE TOKEN ERROR", {
            error: error?.message,
            stack: error?.stack,
        });
        return ResponseHandler.error(res, 500, "Token rotation failed");
    }
};

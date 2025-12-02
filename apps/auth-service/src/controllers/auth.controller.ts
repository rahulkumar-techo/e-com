/* AuthController: Handles auth routes */

import { Request, Response } from "express";
import {
    registerParser,
    loginParser,
    verifyParser,
    forgotParser,
    logoutParser
} from "../validations/auth.validations";

import authService from "../services/auth.service";
import { loginAuth } from "../services/login.service";
import { ResponseHandler } from "../../../../packages/utils";

class AuthController {
    constructor() {
        this.registerUser = this.registerUser.bind(this);
        this.emailVerification = this.emailVerification.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.me = this.me.bind(this);
    }

    /* REGISTER */
    async registerUser(req: Request, res: Response) {
        try {
            const { email, password } = registerParser.parse(req.body);
            return await authService.registerUser({ email, password }, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Registration failed");
        }
    }

    /* VERIFY EMAIL */
    async emailVerification(req: Request, res: Response) {
        try {
            const { otp, email } = verifyParser.parse(req.body);
            return await authService.verifyEmail(otp, email, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Email verification failed");
        }
    }

    /* FORGOT PASSWORD */
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = forgotParser.parse(req.body);
            return await authService.forgotPassword(email, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Forgot password failed");
        }
    }

    /* LOGOUT */
    async logoutUser(req: Request, res: Response) {
        try {
            const { token } = logoutParser.parse(req.body);
            return await authService.logoutUser(token, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Logout failed");
        }
    }

    /* LOGIN */
    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = loginParser.parse(req.body);
            return await loginAuth.login({ email, password }, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Login failed");
        }
    }
    async me(req: Request, res: Response) {
        try {
            return await authService.me((req as any)?.user?.id, req, res);
        } catch (err: any) {
            return this.handleError(res, err, "Login failed");
        }
    }

    /* ERROR HANDLER */
    private handleError(res: Response, err: any, fallbackMsg: string) {
        if (err.name === "ZodError")
            return ResponseHandler.badRequest(res, err.errors[0].message);

        return ResponseHandler.serverError(res, err.message || fallbackMsg);
    }
}

export default new AuthController();

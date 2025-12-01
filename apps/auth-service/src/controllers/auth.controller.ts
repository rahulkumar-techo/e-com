/* AuthController: Handles all auth routes via service methods */

import { Request, Response } from "express";
import { ResponseHandler } from "../../../../../packages/utils";
import { registerParser, loginParser, verifyParser, forgotParser, logoutParser } from "../../validations/auth.validations";
import authService from "../../services/auth.service";

class AuthController {
    constructor() {
        this.registerUser = this.registerUser.bind(this);
        this.emailVerification = this.emailVerification.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
    }


    /* REGISTER */
    async registerUser(req: Request, res: Response) {
        try {
            const { email, password } = registerParser.parse(req.body);
            const data = await authService.registerUser({ email, password });
            return ResponseHandler.success(res, data.userId, data.msg);
        } catch (err: any) {
            return this.handleError(res, err, "Registration failed");
        }
    }

    /* VERIFY EMAIL */
    async emailVerification(req: Request, res: Response) {
        try {
            const { otp, email } = verifyParser.parse(req.body);
            const data = await authService.verifyEmail(otp, email);
            return ResponseHandler.success(res, data.msg);
        } catch (err: any) {
            return this.handleError(res, err, "Email verification failed");
        }
    }

    /* FORGOT PASSWORD */
    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = forgotParser.parse(req.body);
            const data = await authService.forgotPassword(email);
            return ResponseHandler.success(res, data.msg);
        } catch (err: any) {
            return this.handleError(res, err, "Forgot password failed");
        }
    }

    /* LOGIN */
    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = loginParser.parse(req.body);
            const data = await authService.loginUser({ email, password });
            return ResponseHandler.success(res, data.token, data.msg);
        } catch (err: any) {
            return this.handleError(res, err, "Login failed");
        }
    }

    /* LOGOUT */
    async logoutUser(req: Request, res: Response) {
        try {
            const { token } = logoutParser.parse(req.body);
            const data = await authService.logoutUser(token);
            return ResponseHandler.success(res, data.msg);
        } catch (err: any) {
            return this.handleError(res, err, "Logout failed");
        }
    }

    /* Handle validation/server errors */
    private handleError(res: Response, err: any, fallbackMsg: string) {
        if (err.name === "ZodError")
            return ResponseHandler.badRequest(res, err.errors[0].message);

        return ResponseHandler.serverError(res, err.message || fallbackMsg);
    }
}

export default new AuthController();

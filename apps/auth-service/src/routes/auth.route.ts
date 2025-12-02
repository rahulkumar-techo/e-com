/* Auth Routes */

import express from "express";
import AuthController from "../controllers/auth.controller";
import { authAutoRotate } from "../middlewares/authAutoRotate";

const router: express.Router = express.Router();



// Register user
router.post("/register", AuthController.registerUser);

// Verify email
router.post("/verify-email", AuthController.emailVerification);

// Forgot password
router.post("/forgot-password", AuthController.forgotPassword);

// Login user
router.post("/login", AuthController.loginUser);

// Logout user
router.post("/logout", AuthController.logoutUser);

router.get("/me", authAutoRotate, AuthController.me);

export default router;
 
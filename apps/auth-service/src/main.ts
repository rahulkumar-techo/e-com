/* Auth-Service Main Server File */

import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route";
import { connectDB } from "./lib/db";

const app = express();

/* -------- Middlewares -------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());

/* -------- Routes -------- */
app.use("/api/auth", authRouter);

app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to auth-service!" });
});

/* -------- Server Start -------- */
const PORT = process.env.SERVER_PORT || 5001;

async function bootstrap() {
  try {
    // DB connect
    await connectDB(process.env.DATABASE_URL || "");
    console.log("📦 Database connected");

    // Server start
    const server = app.listen(PORT, () => {
      console.log(`🚀 Auth-service running at http://localhost:${PORT}/api`);
    });

    // Global server error
    server.on("error", (err) => {
      console.error("❌ Server error:", err);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Shutting down...");
      server.close(() => process.exit(0));
    });

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received. Shutting down...");
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

bootstrap();

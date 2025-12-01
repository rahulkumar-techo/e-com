/* Main server file for auth-service using ReDoc */

import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";

import authRouter from "./routes/auth.route";
import { connectDB } from "./lib/db";

const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// --- Routes ---
app.use("/api/auth", authRouter);

app.get("/api", (_req, res) => {
  res.send({ message: "Welcome to auth-service!" });
});

// --- Load OpenAPI Spec ---
const specPath = path.join(__dirname, "openapi.json");

let openapiSpec = {};
try {
  openapiSpec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  console.log("✔ OpenAPI spec loaded");
} catch (err) {
  console.error("❌ Failed to load openapi.json");
  console.error(err);
}

// --- Start Server ---
const port = process.env.SERVER_PORT || 5001;

const server = app.listen(port, async () => {
  await connectDB(process.env.DATABASE_URL || "");
  console.log(`🚀 Auth-service running at http://localhost:${port}/api`);
});

server.on("error", console.error);

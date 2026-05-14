import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { authRouter } from "./routes/auth.routes.js";
import { postRouter } from "./routes/post.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

// FRONTEND URLS
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// BODY PARSER
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.set("trust proxy", 1);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MERN Blog API is running",
  });
});

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

// SERVE FRONTEND IN PRODUCTION
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

// DATABASE CONNECTION + SERVER START
const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB Connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
};

startServer();
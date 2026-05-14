import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { authRouter } from "./routes/auth.routes.js";
import { postRouter } from "./routes/post.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// CORS CONFIG
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blog-frontend-eight-sigma.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// HANDLE PREFLIGHT REQUESTS
app.options("*", cors());

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

// HEALTH ROUTE
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

// ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

// START SERVER
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("Server Error:", error);
  }
};

startServer();
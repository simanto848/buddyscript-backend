import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import router from "./routes/index.js";

const app = express();

app.use(helmet());
const allowedOrigins = [process.env.CLIENT_URL];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Compression
app.use(compression());

// Logger
app.use(morgan("dev"));

app.get("/", (req, res) => {
    return res.status(200).json({
        url: req.originalUrl,
        success: true,
        message: "Server is running.",
    });
});

// Routes
app.use("/api", router);

app.use((req, res) => {
    return res.status(404).json({
        url: req.originalUrl,
        success: false,
        message: "Route not found!",
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;
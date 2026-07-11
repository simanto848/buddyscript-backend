import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
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
        // url: req.url,
        success: true,
        message: "Server is running.",
    });
});

// Routes

app.use((req, res) => {
    return res.status(404).json({
        // url: req.url,
        success: false,
        message: "Route not found!",
    });
});

export default app;
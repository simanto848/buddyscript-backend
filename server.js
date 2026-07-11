import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Database connection

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error("Server failed to start: ", error);
        process.exit(1);
    }
}

startServer();
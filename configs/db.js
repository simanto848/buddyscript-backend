import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try {
        const dbConnection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        cachedConnection = dbConnection;
        console.log(`MongoDB Connected: ${dbConnection.connection.host}`);
        return dbConnection;
    } catch (error) {
        console.error("MongoDB Connection Failed: ", error);
        throw error;
    }
}

export default connectDB;
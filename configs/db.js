import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${dbConnection.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed: ", error);
        process.exit(1);
    }
}

export default connectDB;
import mongoose from "mongoose";

export const connectToDatabase  = async () => {
    try {
        const url = process.env.DB || 'mongodb://127.0.0.1:27017/ECHO-DB';
        mongoose.connect(url);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}


import mongoose from "mongoose";

export const connection = async () => {
    try {
        const url = 'mongodb://127.0.0.1:27017/ECHO-DB';
        mongoose.connect(url);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

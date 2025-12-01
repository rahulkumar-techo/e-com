import mongoose from "mongoose";
import { log } from "../../../../packages/utils";

export const connectDB = async (mongoURI: string) => {
    try {
        await mongoose.connect(mongoURI);
        log.info("Connected to MongoDB");
    }
    catch (error) {
        log.error(`MongoDB connection error:\n${error}`);
        process.exit(1);
    }
};


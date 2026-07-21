import mongoose from "mongoose";
import Wishlist from "../models/wishlist.model";

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kitabghar";
    await mongoose.connect(uri);
    console.log("MongoDB connected");

    await Wishlist.syncIndexes();
    console.log("Wishlist indexes synced");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDb(): Promise<void> {
  if (!env.mongodbUri || env.mongodbUri.includes("USER:PASS")) {
    console.warn("MongoDB URI is not configured. Form submissions will fail until MONGODB_URI is set.");
    return;
  }
  await mongoose.connect(env.mongodbUri);
  console.log("MongoDB connected");
}

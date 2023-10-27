import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

/**
 * MongoDB connection
 */
const MONGO_URI = isProduction
  ? process.env.MONGO_URI_PROD
  : process.env.MONGO_URI_DEV;

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Successfully connected to MongoDB...");
  })
  .catch((err) => {
    console.error("Cannot connect to MongoDB", err);
  });

/**
 * Express server
 */
let PORT;
if (isProduction) PORT = process.env.PORT || 80;
else PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Server error, shut it down
 */
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

import express from "express";
import morgan from "morgan";
import cors from "cors";
import v1Routes from "./routes/v1/index.js";
import { converter, notFound } from "./middlewares/error.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
console.log(process.env.CLIENT_URL);
// configure CORS option
// const corsOptions = {
//   origin: process.env.CLIENT_URL,
// };
app.use(cors());

// req logger
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.json());

// API endpoints
app.use("/api/v1", v1Routes);

// Error handler
app.use(notFound);
app.use(converter);

export default app;

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth/auth-routes.js";
import dotenv from "dotenv";


dotenv.config();

//create a db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database conncected successfully"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

//all api endpoints
app.use("/api/auth", authRouter);

//running server
app.listen(PORT, () => console.log(`Server is runnig on port ${PORT}`));

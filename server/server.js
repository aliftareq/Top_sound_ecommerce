import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import cors from "cors";

//create a db connection
mongoose
  .connect(
    "mongodb+srv://aliftareq_db_user:82vprO0byrcz5ynw@cluster0.lq7nw9j.mongodb.net/"
  )
  .then(() => console.log("Database conncected successfully"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173/",
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

app.listen(PORT, () => console.log(`Server is runnig on port ${PORT}`));

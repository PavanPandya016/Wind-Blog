import connectDB from "./db/connect.js";
import "dotenv/config";
import app from "./app.js";
import { json } from "express";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error", err);
  });
app.disable("x-powered-by");


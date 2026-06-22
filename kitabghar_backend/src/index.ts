import express from "express";
import type { CorsOptions } from "cors";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDB } from "./database/mongodb";
import userRoutes from "./routes/user.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/avatars", express.static(path.join(__dirname, "../public/avatars")));

app.use("/api/v1/auth", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "KitabGhar API is running" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
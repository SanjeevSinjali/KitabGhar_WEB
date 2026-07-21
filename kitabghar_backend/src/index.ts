import express from "express";
import type { CorsOptions } from "cors";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDB } from "./database/mongodb";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminNotificationRoutes from "./routes/admin/notification.route";
import adminBookRoutes from "./routes/admin/book.route";
import bookRoutes from "./routes/book.route";
import wishlistRoutes from "./routes/wishlist.route";
import purchaseRoutes from "./routes/purchase.route";
import notificationRoutes from "./routes/notification.route";

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
app.use("/books", express.static(path.join(__dirname, "../public/books")));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/notifications", adminNotificationRoutes);
app.use("/api/v1/admin/books", adminBookRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "KitabGhar API is running" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
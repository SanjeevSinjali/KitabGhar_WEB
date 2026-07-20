import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

const avatarStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const dir = "public/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${(req as any).user.id}_${Date.now()}${ext}`);
  },
});

const bookStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const dir = "public/books";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `book_${(req as any).user.id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only jpg, png, webp images are allowed"));
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const uploadBookImage = multer({
  storage: bookStorage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});
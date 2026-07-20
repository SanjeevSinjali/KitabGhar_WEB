import { Router } from "express";
import { protect } from "../middleware/auth";
import { uploadBookImage } from "../middleware/uploads";
import { createBook, getMyBooks } from "../controllers/book.controller";

const router = Router();

router.use(protect);

router.post("/", uploadBookImage.single("image"), createBook);
router.get("/mine", getMyBooks);

export default router;
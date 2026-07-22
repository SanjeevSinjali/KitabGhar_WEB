import { Router } from "express";
import { protect } from "../middleware/auth";
import { uploadBookImage } from "../middleware/uploads";
import { createBook, getMyBooks, getFeaturedBooks, searchBooksHandler } from "../controllers/book.controller";

const router = Router();

router.use(protect);

router.post("/", uploadBookImage.single("image"), createBook);
router.get("/mine", getMyBooks);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooksHandler);

export default router;
import { Router } from "express";
import { protect } from "../middleware/auth";
import { toggleBookWishlist, deleteWishlistItem, getWishlist } from "../controllers/wishlist.controller";

const router = Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleBookWishlist);
router.delete("/:bookId", deleteWishlistItem);

export default router;
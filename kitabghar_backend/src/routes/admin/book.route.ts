import { Router } from "express";
import { protect } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { listBooks, getBook, deleteBook, updateStatus } from "../../controllers/admin/book.controller";

const router = Router();

router.use(protect, adminOnly);

router.get("/", listBooks);
router.get("/:id", getBook);
router.delete("/:id", deleteBook);
router.patch("/:id/status", updateStatus);

export default router;
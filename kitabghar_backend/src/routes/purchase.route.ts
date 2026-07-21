import { Router } from "express";
import { protect } from "../middleware/auth";
import { purchaseBook, getPurchases } from "../controllers/purchase.controller";

const router = Router();

router.use(protect);

router.get("/", getPurchases);
router.post("/", purchaseBook);

export default router;
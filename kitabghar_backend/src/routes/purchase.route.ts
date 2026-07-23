import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  purchaseBook,
  getPurchases,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../controllers/purchase.controller";

const router = Router();

router.use(protect);

router.get("/", getPurchases);
router.post("/", purchaseBook);
router.post("/khalti/initiate", initiateKhaltiPayment);
router.post("/khalti/verify", verifyKhaltiPayment);

export default router;
import { Router } from "express";
import { protect } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { getNotifications, markRead, markAllRead } from "../../controllers/admin/notification.controller";

const router = Router();

router.use(protect, adminOnly);

router.get("/", getNotifications);
router.patch("/:id/read", markRead);
router.patch("/read-all", markAllRead);

export default router;
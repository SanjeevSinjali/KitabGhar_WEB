import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getMyNotifications,
  markMyNotificationRead,
  markAllMyNotificationsRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.patch("/:id/read", markMyNotificationRead);
router.patch("/read-all", markAllMyNotificationsRead);

export default router;
import { Router } from "express";
import {
  register,
  login,
  whoami,
  updateProfile,
  requestPasswordChange,
  confirmPasswordChange,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth";
import { uploadAvatar } from "../middleware/uploads";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// Protected routes
router.get("/whoami", protect, whoami);
router.put("/update", protect, uploadAvatar.single("avatar"), updateProfile);
router.post("/change-password/request-code", protect, requestPasswordChange);
router.patch("/change-password/confirm", protect, confirmPasswordChange);

export default router;
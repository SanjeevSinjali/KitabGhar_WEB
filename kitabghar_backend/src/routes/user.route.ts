import { Router } from "express";
import { register, login, whoami, updateProfile } from "../controllers/user.controller";
import { protect } from "../middleware/auth";
import { uploadAvatar } from "../middleware/uploads";

const router = Router();

router.post("/register", register);
router.post("/login", login);
// Protected routes
router.get("/whoami", protect, whoami);
router.put("/update", protect, uploadAvatar.single("avatar"), updateProfile);

export default router;
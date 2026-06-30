import { Router } from "express";
import { protect } from "../../middleware/auth";
import { adminOnly } from "../../middleware/admin";
import { uploadAvatar } from "../../middleware/uploads";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/admin/user.controller";

const router = Router();

router.use(protect, adminOnly);

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", uploadAvatar.single("avatar"), updateUser);
router.delete("/:id", deleteUser);

export default router;
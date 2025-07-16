import { Router } from "express";
import roleMiddleware from "src/middlewares/roleMiddleware";
import {
  deleteUser,
  getAllUsers,
  getMe,
  getUserById,
  updateUser,
} from "./userController";
import authMiddleware from "src/middlewares/authMiddleware";

const router: Router = Router();

// ✅ Allow any authenticated user to access their own info
router.get("/me", authMiddleware, getMe);

// ✅ All routes below this are for admin only
router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/users/all", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;

import { Router } from "express";
import adminMiddleware from "src/middlewares/adminMiddleware";
import { disableUser, enableUser, getAllUsers, softDeleteUser } from "./adminController";
import authMiddleware from "src/middlewares/authMiddleware";

const router = Router();

// Middleware: Authenticated + Must be Admin
router.use(authMiddleware, adminMiddleware);

// Routes
router.get("/users", getAllUsers);
router.put("/users/:id/disable", disableUser); 
router.put("/users/:id/enable", enableUser);  
router.delete("/users/:id", softDeleteUser);

export default router;

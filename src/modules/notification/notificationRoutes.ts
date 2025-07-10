import { Router } from "express";
import * as notificationController from "./notificationController";
import authMiddleware from "src/middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, notificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

export default router;

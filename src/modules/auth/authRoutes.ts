import { Router } from "express";
import { getProfile, login, logout, refresh, register } from "./authController";
import authMiddleware from "src/middlewares/authMiddleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile);

export default router;

import { Router } from "express";
import { requestPasswordReset, resetPassword } from "./forgetPasswordContoller";

const router = Router();

router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;

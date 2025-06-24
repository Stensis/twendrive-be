const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getProfile,
} = require("../controllers/auth/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;

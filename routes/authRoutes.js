const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "User profile", user: req.user });
});

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin route access granted!" });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "User profile", user: req.user });
});

router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin route access granted!" });
});

module.exports = router;

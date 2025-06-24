const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/admin/usersController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

// View all users
router.get("/users", getAllUsers);

// Soft delete user (scheduled 30-day deletion)
router.delete("/users/:id", deleteUser);

module.exports = router;

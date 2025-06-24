const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true, role: true },
  });
  res.status(200).json(users);
};

// Soft delete user (mark for deletion)
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(), // mark as soft deleted
        deleteAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      },
    });

    res.status(200).json({
      message: `User '${user.email}' marked for deletion in 30 days.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

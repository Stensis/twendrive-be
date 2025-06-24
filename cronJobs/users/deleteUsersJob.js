const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Run daily at midnight
const deleteExpiredUsers = cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    const usersToDelete = await prisma.user.findMany({
      where: {
        deleteAfter: {
          lte: now,
        },
      },
    });

    if (usersToDelete.length === 0) {
      console.log("✅ No users to hard delete today.");
      return;
    }

    // Hard delete them
    const deletePromises = usersToDelete.map((user) =>
      prisma.user.delete({ where: { id: user.id } })
    );
    await Promise.all(deletePromises);

    console.log(`🧹 Deleted ${usersToDelete.length} expired user(s) at ${now}`);
  } catch (error) {
    console.error("❌ Error deleting expired users:", error);
  }
});

module.exports = deleteExpiredUsers;

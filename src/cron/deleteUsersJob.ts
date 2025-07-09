import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type User = Awaited<ReturnType<typeof prisma.user.findMany>>[number]; 

const deleteExpiredUsers = cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();

    const usersToDelete: User[] = await prisma.user.findMany({
      where: {
        deleteAfter: {
          lte: now,
        },
      },
    });

    if (usersToDelete.length === 0) {
      console.log('✅ No users to hard delete today.');
      return;
    }

    const deletePromises = usersToDelete.map((user) =>
      prisma.user.delete({ where: { id: user.id } })
    );
    await Promise.all(deletePromises);

    console.log(`🧹 Deleted ${usersToDelete.length} expired user(s) at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error deleting expired users:', error);
  }
});

export default deleteExpiredUsers;

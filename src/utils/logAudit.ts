import prisma from "src/config/database";

export const logAudit = async ({
  userId,
  action,
  metadata,
}: {
  userId: number;
  action: string;
  metadata: Record<string, any>;
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      metadata,
    },
  });
};

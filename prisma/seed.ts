import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  // Ensure the phone number is unique (add timestamp or random digits)
  const uniquePhone = "071234" + Math.floor(1000 + Math.random() * 9000);

  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      phone: uniquePhone,
      role: "admin",
    },
  });

  console.log("✅ Admin created successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

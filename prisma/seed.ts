import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  // === 1. Seed Admin ===
  const existingAdmin = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: process.env.ADMIN_EMAIL!,
        password: adminPassword,
        phone: "071234" + Math.floor(1000 + Math.random() * 9000),
        role: "admin",
        emailVerified: true, // ✅ Add this
      },
    });

    console.log("✅ Admin created.");
  } else {
    console.log("✅ Admin already exists.");
  }

  // === 2. Create Car Owner ===
  const ownerEmail = "irenenjuguna98@gmail.com";
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  let owner;
  if (!existingOwner) {
    const ownerPassword = await bcrypt.hash("Strongpassword@123", 10);
    owner = await prisma.user.create({
      data: {
        firstName: "Irene",
        lastName: "Njuguna",
        email: ownerEmail,
        password: ownerPassword,
        phone: "0700" + Math.floor(1000 + Math.random() * 9000),
        role: "car_owner",
        emailVerified: true,
      },
    });
    console.log("🚗 Car owner created.");
  } else {
    owner = existingOwner;
    console.log("🚗 Car owner already exists.");
  }

  // === 3. Populate Cars ===
  const carCount = await prisma.car.count({ where: { ownerId: owner.id } });

  if (carCount === 0) {
    await prisma.car.createMany({
      data: [
        {
          name: "Toyota Corolla",
          numberPlate: "KDA123A",
          make: "Toyota",
          model: "Corolla",
          year: 2019,
          fuelType: "Petrol",
          mileage: 45000,
          image: "https://hips.hearstapps.com/hmg-prod/images/2025-toyota-corolla-fx-102-6674930515eb4.jpg?crop=0.484xw:0.323xh;0.207xw,0.331xh&resize=1200:*",
          price: 3000,
          location: "Nairobi",
          ownerId: owner.id,
          features: ["Air Conditioning", "Bluetooth", "Reverse Camera"],
          inspectionStatus: "approved",
        },
        {
          name: "Mazda Demio",
          numberPlate: "KDB456B",
          make: "Mazda",
          model: "Demio",
          year: 2018,
          fuelType: "Petrol",
          mileage: 38000,
          image: "https://media.automotiveworld.com/app/uploads/2014/09/12084320/Mazda-Demio.jpg",
          price: 2500,
          location: "Nairobi",
          ownerId: owner.id,
          features: ["Power Windows", "ABS", "Keyless Entry"],
          inspectionStatus: "approved",
        },
        {
          name: "Nissan X-Trail",
          numberPlate: "KCJ789C",
          make: "Nissan",
          model: "X-Trail",
          year: 2020,
          fuelType: "Diesel",
          mileage: 60000,
          image: "https://imgd.aeplcdn.com/1920x1080/n/cw/ec/133165/x-trail-exterior-right-front-three-quarter-27.jpeg?isig=0&q=80&q=80",
          price: 5000,
          location: "Nairobi",
          ownerId: owner.id,
          features: ["4WD", "Cruise Control", "Leather Seats"],
          inspectionStatus: "pending",
        },
      ],
    });

    console.log("🚙 Sample cars added for Irene Njuguna.");
  } else {
    console.log("🚙 Cars already exist for car owner.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

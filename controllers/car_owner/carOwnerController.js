const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all cars for logged-in owner
// Get all cars for logged-in owner
exports.getCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        ownerId: req.user.id,
        deletedAt: null, // Only fetch cars that are NOT soft-deleted
      },
      select: {
        id: true,
        uuid: true,
        numberPlate: true,
        name: true,
        image: true,
        status: true,
        price: true,
        bookings: true,
        rating: true,
        totalEarnings: true,
        location: true,
        description: true,
        lastInspection: true,
        inspectionStatus: true,
        inspectionImages: true,
        ownerId: true,
        createdAt: true,
      },
    });

    res.status(200).json({ cars });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cars", error: err.message });
  }
};


// Add new car
exports.addCar = async (req, res) => {
  const {
    name,
    image,
    price,
    location,
    description,
    lastInspection,
    inspectionStatus,
    inspectionImages,
    numberPlate, // ✅ Add this
  } = req.body;

  try {
    const car = await prisma.car.create({
      data: {
        name,
        image,
        price: parseFloat(price),
        location,
        description,
        lastInspection: lastInspection ? new Date(lastInspection) : null,
        inspectionStatus,
        inspectionImages,
        numberPlate, // ✅ Save number plate
        ownerId: req.user.id,
      },
    });

    res.status(201).json({ message: "Car added", car });
  } catch (err) {
    res.status(500).json({ message: "Failed to add car", error: err.message });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  const { uuid } = req.params;
  const { numberPlate, ...data } = req.body; // Prevent numberPlate edits

  try {
    const car = await prisma.car.findUnique({
      where: { uuid },
    });

    if (!car || car.ownerId !== req.user.id) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }

    const updated = await prisma.car.update({
      where: { uuid },
      data,
    });

    res.status(200).json({ message: "Car updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};


// Delete car
// Soft delete car
exports.deleteCar = async (req, res) => {
  const { uuid } = req.params;

  try {
    const car = await prisma.car.findUnique({ where: { uuid } });

    if (!car || car.ownerId !== req.user.id) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }

    await prisma.car.update({
      where: { uuid },
      data: {
        status: "deleted",
        deletedAt: new Date(),
      },
    });

    res.status(200).json({ message: "Car marked as deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

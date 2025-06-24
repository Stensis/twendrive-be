const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const allowedRoles = ["admin", "car_owner", "car_renter"];

    // Ensure valid role
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Restrict admin account creation
    if (role === "admin") {
      if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
      ) {
        return res
          .status(403)
          .json({
            message: "You are not authorized to create an admin account",
          });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role || role.trim() === "") {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    // Match the role passed during login with the user's stored role
    if (user.role !== role) {
      return res
        .status(403)
        .json({
          message: `Unauthorized: expected role '${user.role}', but received '${role}'`,
        });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

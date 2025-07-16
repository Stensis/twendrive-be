import { Router } from "express";
import adminRoutes from "../modules/admin/adminRoutes";
import authRoutes from "@modules/auth/authRoutes";
import carRoutes from "@modules/car/carRoutes";
import bookingRoutes from "@modules/booking/bookingRoutes";
import carDocumentRoutes from "@modules/carDocuments/carDocumentRoutes";
import availabilityRoutes from "@modules/availability/availabilityRoutes";
import paymentRoutes from "@modules/payment/paymentRoutes";
import reviewRoutes from "@modules/review/reviewRoutes";
import pricingRoutes from "@modules/pricing/pricingRoutes";
import resetPasswordRoutes from "@modules/password/resetPasswordRoutes";
import userRoutes from "@modules/users/userRoutes";

const router = Router();

router.use("/auth", authRoutes); // Register, login, logout, refresh, profile
router.use("/password", resetPasswordRoutes);
router.use("/users", userRoutes);
router.use("/booking", bookingRoutes);
router.use("/admin", adminRoutes); // Admin-only actions like user management
router.use("/car", carRoutes); // Routes for both car owners & renters via middleware
router.use("/booking", bookingRoutes);
router.use("/car-documents", carDocumentRoutes);
router.use("/availability", availabilityRoutes);
router.use("/payment", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/pricing", pricingRoutes);

export default router;

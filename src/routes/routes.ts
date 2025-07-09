import { Router } from 'express';
import adminRoutes from '../modules/admin/adminRoutes';
import authRoutes from '@modules/auth/authRoutes';
import carRoutes from '@modules/car/carRoutes';

const router = Router();

router.use('/auth', authRoutes);   // Register, login, logout, refresh, profile
router.use('/admin', adminRoutes); // Admin-only actions like user management
router.use('/car', carRoutes);     // Routes for both car owners & renters via middleware

export default router;

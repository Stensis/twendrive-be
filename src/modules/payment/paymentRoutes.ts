import { Router } from 'express';
import { createPayment, getAllPayments, getMyPayments } from './paymentController';
import authMiddleware from 'src/middlewares/authMiddleware';
import roleMiddleware from 'src/middlewares/roleMiddleware';

const router = Router();

// Create payment for a booking
router.post('/:bookingId', authMiddleware, roleMiddleware(['car_renter']), createPayment);

// Admin can view all payments
router.get('/admin/all', authMiddleware, roleMiddleware(['admin']), getAllPayments);

// Renter views their own payments
router.get('/my', authMiddleware, roleMiddleware(['car_renter']), getMyPayments);

export default router;

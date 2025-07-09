import { Router } from 'express';
import {
  addCar,
  deleteCar,
  getAllCars,
  getMyCars,
  updateCar,
} from './carController';
import authMiddleware from 'src/middlewares/authMiddleware';
import roleMiddleware from 'src/middlewares/roleMiddleware';

const router: Router = Router();

// All users (admin, car_owner, car_renter) can view cars
router.get('/cars', authMiddleware, getAllCars);

// Only car owners can manage their own cars
router.get('/cars/my', authMiddleware, roleMiddleware(['car_owner']), getMyCars);
router.post('/cars', authMiddleware, roleMiddleware(['car_owner']), addCar);
router.put('/cars/:uuid', authMiddleware, roleMiddleware(['car_owner']), updateCar);
router.delete('/cars/:uuid', authMiddleware, roleMiddleware(['car_owner']), deleteCar);

export default router;

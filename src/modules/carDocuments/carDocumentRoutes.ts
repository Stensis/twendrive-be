import { Router } from 'express';
import {
  uploadCarDocument,
  getCarDocuments,
  deleteCarDocument,
} from './carDocumentController';
import authMiddleware from 'src/middlewares/authMiddleware';
import roleMiddleware from 'src/middlewares/roleMiddleware';

const router = Router();

router.post(
  '/:carId/upload',
  authMiddleware,
  roleMiddleware(['car_owner']),
  uploadCarDocument
);

router.get(
  '/:carId',
  authMiddleware,
  getCarDocuments
);

router.delete(
  '/:documentId',
  authMiddleware,
  roleMiddleware(['car_owner', 'admin']),
  deleteCarDocument
);

export default router;

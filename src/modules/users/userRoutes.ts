import { Router } from 'express';
import roleMiddleware from 'src/middlewares/roleMiddleware';
import { deleteUser, getAllUsers, getUserById, updateUser } from './userController';
import authMiddleware from 'src/middlewares/authMiddleware';

const router: Router = Router();

// Apply auth and restrict to admins
router.use(authMiddleware, roleMiddleware(['admin']));


router.get("/users/all", getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

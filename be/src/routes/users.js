import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getUsers, createUser, updateUser, deleteUser, resetPassword,
} from '../controllers/userController.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/reset-password', resetPassword);

export default router;

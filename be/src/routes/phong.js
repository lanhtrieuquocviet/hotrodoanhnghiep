import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getPhong, createPhong, updatePhong, deletePhong } from '../controllers/phongController.js';

const router = Router();

router.use(protect);
router.get('/', getPhong);

router.use(adminOnly);
router.post('/', createPhong);
router.put('/:id', updatePhong);
router.delete('/:id', deletePhong);

export default router;

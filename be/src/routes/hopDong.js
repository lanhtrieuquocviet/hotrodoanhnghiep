import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboard,
  getNhanVien,
  getHopDongs,
  createHopDong,
  updateHopDong,
  deleteHopDong,
} from '../controllers/hopDongController.js';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/nhan-vien', getNhanVien);
router.get('/', getHopDongs);
router.post('/', createHopDong);
router.put('/:id', updateHopDong);
router.delete('/:id', deleteHopDong);

export default router;

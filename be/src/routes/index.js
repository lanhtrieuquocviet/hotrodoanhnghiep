import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import hopDongRoutes from './hopDong.js';
import phongRoutes from './phong.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hop-dong', hopDongRoutes);
router.use('/phong', phongRoutes);

export default router;

import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import hopDongRoutes from './hopDong.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hop-dong', hopDongRoutes);

export default router;

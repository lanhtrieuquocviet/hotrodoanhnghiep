import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Không có quyền truy cập' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive)
      return res.status(401).json({ message: 'Tài khoản không hợp lệ' });
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện' });
  next();
};

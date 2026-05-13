import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới tối thiểu 6 ký tự' });

    const user = await (await import('../models/User.js')).default.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) { next(err); }
};

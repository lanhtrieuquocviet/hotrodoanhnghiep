import User from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const search = req.query.search?.trim() || '';

    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phong } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email đã tồn tại' });

    const user = await User.create({ name, email, password, role, phong: phong || null });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, phong } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive, phong: phong || null },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Không thể xóa chính mình' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã xóa tài khoản' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    user.password = password;
    await user.save();
    res.json({ message: 'Đã đặt lại mật khẩu' });
  } catch (err) { next(err); }
};

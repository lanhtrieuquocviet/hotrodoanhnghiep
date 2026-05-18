import Phong from '../models/Phong.js';

const DEFAULT_PHONG = [
  'Phòng Dịch vụ Tổng hợp, Đào tạo và Bồi dưỡng',
  'Phòng Dịch vụ Khoa học Công nghệ',
];

export const getPhong = async (req, res, next) => {
  try {
    let phongs = await Phong.find({}).sort({ createdAt: 1 });
    if (phongs.length === 0) {
      await Phong.insertMany(DEFAULT_PHONG.map(ten => ({ ten })));
      phongs = await Phong.find({}).sort({ createdAt: 1 });
    }
    res.json(phongs);
  } catch (err) { next(err); }
};

export const createPhong = async (req, res, next) => {
  try {
    const { ten } = req.body;
    if (!ten?.trim()) return res.status(400).json({ message: 'Tên phòng không được để trống' });
    const exists = await Phong.findOne({ ten: ten.trim() });
    if (exists) return res.status(400).json({ message: 'Tên phòng đã tồn tại' });
    const phong = await Phong.create({ ten: ten.trim() });
    res.status(201).json(phong);
  } catch (err) { next(err); }
};

export const updatePhong = async (req, res, next) => {
  try {
    const { ten } = req.body;
    if (!ten?.trim()) return res.status(400).json({ message: 'Tên phòng không được để trống' });
    const exists = await Phong.findOne({ ten: ten.trim(), _id: { $ne: req.params.id } });
    if (exists) return res.status(400).json({ message: 'Tên phòng đã tồn tại' });
    const phong = await Phong.findByIdAndUpdate(
      req.params.id,
      { ten: ten.trim() },
      { new: true, runValidators: true }
    );
    if (!phong) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    res.json(phong);
  } catch (err) { next(err); }
};

export const deletePhong = async (req, res, next) => {
  try {
    const phong = await Phong.findByIdAndDelete(req.params.id);
    if (!phong) return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    res.json({ message: 'Đã xóa phòng ban' });
  } catch (err) { next(err); }
};

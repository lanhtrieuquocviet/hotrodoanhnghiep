import HopDong from '../models/HopDong.js';
import User from '../models/User.js';

/* ── DASHBOARD ── */
export const getDashboard = async (req, res, next) => {
  try {
    const { user } = req;

    if (user.role !== 'admin' && user.phong) {
      const matchPhong = { phong: user.phong };
      const [theoNhanVien, tongHopDong, doanhThuPhong] = await Promise.all([
        HopDong.aggregate([
          { $match: matchPhong },
          { $group: { _id: '$nguoiPhuTrach', soLuong: { $sum: 1 }, giaTriTong: { $sum: '$giaTriHopDong' } } },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'nv' } },
          { $unwind: { path: '$nv', preserveNullAndEmptyArrays: true } },
          { $project: { tenNhanVien: { $ifNull: ['$nv.name', 'Không xác định'] }, soLuong: 1, giaTriTong: 1 } },
          { $sort: { giaTriTong: -1 } },
        ]),
        HopDong.countDocuments(matchPhong),
        HopDong.aggregate([
          { $match: matchPhong },
          { $group: { _id: null, total: { $sum: '$giaTriHopDong' } } },
        ]).then((r) => r[0]?.total || 0),
      ]);
      return res.json({
        viewType: 'theo-phong', phong: user.phong, tongHopDong, doanhThuPhong,
        theoNhanVien: theoNhanVien.map((x) => ({ tenNhanVien: x.tenNhanVien, soLuong: x.soLuong, giaTriTong: x.giaTriTong })),
      });
    }

    const [theoPhong, theoKhu, tongDoanhNghiep, tongHopDong] = await Promise.all([
      HopDong.aggregate([
        { $group: { _id: '$phong', soLuong: { $sum: 1 }, giaTriTong: { $sum: '$giaTriHopDong' } } },
        { $sort: { soLuong: -1 } },
      ]),
      HopDong.aggregate([
        { $group: { _id: '$khuCongNghiep', soLuong: { $sum: 1 } } },
        { $sort: { soLuong: -1 } },
      ]),
      HopDong.distinct('tenDoanhNghiep').then((arr) => arr.length),
      HopDong.countDocuments(),
    ]);

    res.json({
      viewType: 'tong-hop', tongDoanhNghiep, tongHopDong,
      theoPhong: theoPhong.map((x) => ({ phong: x._id, soLuong: x.soLuong, giaTriTong: x.giaTriTong })),
      theoKhuCongNghiep: theoKhu.map((x) => ({ khuCongNghiep: x._id, soLuong: x.soLuong })),
    });
  } catch (err) { next(err); }
};

/* ── NHÂN VIÊN theo phòng (cho dropdown) ── */
export const getNhanVien = async (req, res, next) => {
  try {
    const phong = req.query.phong || req.user.phong;
    if (!phong) return res.json([]);
    const users = await User.find({ phong, isActive: true }).select('name phong').sort('name');
    res.json(users);
  } catch (err) { next(err); }
};

/* ── CRUD ── */
export const getHopDongs = async (req, res, next) => {
  try {
    const { user } = req;
    const search = req.query.search?.trim() || '';
    const phongFilter = req.query.phong || '';

    const filter = {};
    if (user.role !== 'admin' && user.phong) filter.phong = user.phong;
    else if (phongFilter) filter.phong = phongFilter;
    if (search) filter.tenDoanhNghiep = { $regex: search, $options: 'i' };

    const hopDongs = await HopDong.find(filter)
      .populate('nguoiPhuTrach', 'name phong')
      .sort({ nguoiPhuTrach: 1, createdAt: 1 });

    res.json({ hopDongs, total: hopDongs.length });
  } catch (err) { next(err); }
};

export const createHopDong = async (req, res, next) => {
  try {
    const { user } = req;
    const body = { ...req.body };
    if (user.role !== 'admin' && user.phong) body.phong = user.phong;
    const hopDong = await (await HopDong.create(body)).populate('nguoiPhuTrach', 'name phong');
    res.status(201).json(hopDong);
  } catch (err) { next(err); }
};

export const updateHopDong = async (req, res, next) => {
  try {
    const hopDong = await HopDong.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('nguoiPhuTrach', 'name phong');
    if (!hopDong) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json(hopDong);
  } catch (err) { next(err); }
};

export const deleteHopDong = async (req, res, next) => {
  try {
    const hopDong = await HopDong.findByIdAndDelete(req.params.id);
    if (!hopDong) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    res.json({ message: 'Đã xóa hợp đồng' });
  } catch (err) { next(err); }
};

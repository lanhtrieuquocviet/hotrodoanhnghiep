import HopDong from '../models/HopDong.js';
import User from '../models/User.js';

const KHU_KHAC = 'Khác';
const KHU_PRESET = [
  'CNC Hòa Lạc', 'Nội Bài', 'Phú Nghĩa', 'Quang Minh', 'Sài Đồng',
  'Thăng Long', 'Thạch Thất Quốc Oai', 'Bắc Thăng Long',
];
const TRANG_THAI_KY = ['Đã ký kết', 'Đang thương thảo', 'Chưa ký'];
const TRANG_THAI_HD = ['Đang thực hiện', 'Đã hoàn thành', 'Hủy'];
const XAC_NHAN_OPT = ['', 'Hoàn thành', 'Chưa hoàn thành'];

function validateHopDongBody(body) {
  const ten = body.tenDoanhNghiep?.trim();
  if (!ten) return 'Tên doanh nghiệp không được để trống';
  if (ten.length < 2) return 'Tên doanh nghiệp quá ngắn';
  if (ten.length > 200) return 'Tên doanh nghiệp tối đa 200 ký tự';

  if (!body.phong?.trim()) return 'Phòng ban không được để trống';

  if (body.soHopDong?.trim().length > 50) return 'Số hợp đồng tối đa 50 ký tự';
  if (body.sdtVaNguoiLienHe?.trim().length > 100) return 'SDT / người liên hệ tối đa 100 ký tự';

  if (body.khuCongNghiep) {
    const khu = body.khuCongNghiep.trim();
    if (khu === KHU_KHAC) return 'Vui lòng nhập tên khu công nghiệp';
    if (!KHU_PRESET.includes(khu) && (khu.length < 2 || khu.length > 100)) {
      return 'Tên khu công nghiệp không hợp lệ (2–100 ký tự)';
    }
    body.khuCongNghiep = khu;
  }

  if (body.linhVuc?.trim().length > 200) return 'Lĩnh vực tối đa 200 ký tự';
  if (body.trangThaiKy && !TRANG_THAI_KY.includes(body.trangThaiKy)) return 'Tình trạng ký kết không hợp lệ';
  if (body.trangThai && !TRANG_THAI_HD.includes(body.trangThai)) return 'Tình trạng thực hiện không hợp lệ';
  if (body.xacNhan != null && body.xacNhan !== '' && !XAC_NHAN_OPT.includes(body.xacNhan)) {
    return 'Xác nhận không hợp lệ';
  }

  const gt = Number(body.giaTriHopDong);
  if (body.giaTriHopDong != null && (Number.isNaN(gt) || gt < 0)) {
    return 'Giá trị hợp đồng phải là số không âm';
  }
  if (gt > 1e15) return 'Giá trị hợp đồng quá lớn';

  if (body.ghiChu?.trim().length > 500) return 'Ghi chú tối đa 500 ký tự';

  return null;
}

/* ── DASHBOARD ── */
export const getDashboard = async (req, res, next) => {
  try {
    const { user } = req;

    if (user.role === 'truong_phong' && user.phong) {
      const matchPhong = { phong: user.phong };
      const nhanVienAgg = [
        { $match: matchPhong },
        { $group: { _id: '$nguoiPhuTrach', soLuong: { $sum: 1 }, giaTriTong: { $sum: '$giaTriHopDong' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'nv' } },
        { $unwind: { path: '$nv', preserveNullAndEmptyArrays: true } },
        { $project: { tenNhanVien: { $ifNull: ['$nv.name', 'Không xác định'] }, soLuong: 1, giaTriTong: 1 } },
        { $sort: { giaTriTong: -1 } },
      ];
      const [theoNhanVien, tongHopDong, doanhThuPhong, theoTrangThai, theoTrangThaiKy, tongDoanhNghiep] = await Promise.all([
        HopDong.aggregate(nhanVienAgg),
        HopDong.countDocuments(matchPhong),
        HopDong.aggregate([{ $match: matchPhong }, { $group: { _id: null, total: { $sum: '$giaTriHopDong' } } }])
          .then((r) => r[0]?.total || 0),
        HopDong.aggregate([
          { $match: matchPhong },
          { $group: { _id: '$trangThai', soLuong: { $sum: 1 } } },
        ]),
        HopDong.aggregate([
          { $match: matchPhong },
          { $group: { _id: '$trangThaiKy', soLuong: { $sum: 1 } } },
        ]),
        HopDong.distinct('tenDoanhNghiep', matchPhong).then((arr) => arr.length),
      ]);
      return res.json({
        viewType: 'truong-phong', phong: user.phong, tongHopDong, doanhThuPhong, tongDoanhNghiep,
        theoNhanVien: theoNhanVien.map((x) => ({ tenNhanVien: x.tenNhanVien, soLuong: x.soLuong, giaTriTong: x.giaTriTong })),
        theoTrangThai: theoTrangThai.map((x) => ({ trangThai: x._id || 'Không rõ', soLuong: x.soLuong })),
        theoTrangThaiKy: theoTrangThaiKy.map((x) => ({ trangThaiKy: x._id || 'Không rõ', soLuong: x.soLuong })),
      });
    }

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

/* ── TRƯỞNG PHÒNG theo phòng ── */
export const getTruongPhong = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'truong_phong', isActive: true }).select('name phong');
    const map = {};
    users.forEach((u) => { if (u.phong) map[u.phong] = u.name; });
    res.json(map);
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
      .populate('nguoiPhuTrach', 'name phong role')
      .sort({ nguoiPhuTrach: 1, createdAt: 1 });

    res.json({ hopDongs, total: hopDongs.length });
  } catch (err) { next(err); }
};

export const createHopDong = async (req, res, next) => {
  try {
    const { user } = req;
    const body = { ...req.body };

    if (user.role === 'truong_phong') {
      body.phong = user.phong;
      if (!body.nguoiPhuTrach) body.nguoiPhuTrach = user._id;
    } else if (user.role !== 'admin' && user.phong) {
      body.phong = user.phong;
      body.nguoiPhuTrach = user._id;
    }

    const errMsg = validateHopDongBody(body);
    if (errMsg) return res.status(400).json({ message: errMsg });

    const hopDong = await HopDong.create(body).then(d => d.populate('nguoiPhuTrach', 'name phong role'));
    res.status(201).json(hopDong);
  } catch (err) { next(err); }
};

export const updateHopDong = async (req, res, next) => {
  try {
    const { user } = req;
    const existing = await HopDong.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });

    const body = { ...req.body };
    if (user.role === 'truong_phong') {
      body.phong = user.phong;
      if (!body.nguoiPhuTrach) body.nguoiPhuTrach = existing.nguoiPhuTrach || user._id;
    } else if (user.role !== 'admin' && user.phong) {
      body.phong = user.phong;
      body.nguoiPhuTrach = existing.nguoiPhuTrach || user._id;
    }

    const errMsg = validateHopDongBody({ ...existing.toObject(), ...body });
    if (errMsg) return res.status(400).json({ message: errMsg });

    const hopDong = await HopDong.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
      .populate('nguoiPhuTrach', 'name phong role');
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

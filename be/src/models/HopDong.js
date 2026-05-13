import mongoose from 'mongoose';

const hopDongSchema = new mongoose.Schema(
  {
    soHopDong: { type: String, trim: true },
    tenDoanhNghiep: { type: String, required: true, trim: true },
    phong: {
      type: String,
      required: true,
      enum: ['Phòng Dịch vụ Tổng hợp, Đào tạo và Bồi dưỡng', 'Phòng Dịch vụ Khoa học Công nghệ'],
    },
    nguoiPhuTrach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sdtVaNguoiLienHe: { type: String, trim: true },
    khuCongNghiep: {
      type: String,
      enum: ['CNC Hòa Lạc', 'Khác', 'Nội Bài', 'Phú Nghĩa', 'Quang Minh', 'Sài Đồng', 'Thăng Long', 'Thạch Thất Quốc Oai', 'Bắc Thăng Long'],
    },
    linhVuc: { type: String, trim: true },
    trangThaiKy: {
      type: String,
      enum: ['Đã ký kết', 'Đang thương thảo', 'Chưa ký'],
      default: 'Chưa ký',
    },
    ngayKy: { type: Date },
    giaTriHopDong: { type: Number, default: 0 },
    trangThai: {
      type: String,
      enum: ['Đang thực hiện', 'Đã hoàn thành', 'Hủy'],
      default: 'Đang thực hiện',
    },
    xacNhan: {
      type: String,
      enum: ['Hoàn thành', 'Chưa hoàn thành', ''],
      default: '',
    },
    ghiChu: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('HopDong', hopDongSchema);

import api from './axios'

export type DashboardData =
  | {
      viewType: 'tong-hop'
      tongDoanhNghiep: number
      tongHopDong: number
      theoPhong: { phong: string; soLuong: number; giaTriTong: number }[]
      theoKhuCongNghiep: { khuCongNghiep: string; soLuong: number }[]
    }
  | {
      viewType: 'theo-phong'
      phong: string
      tongHopDong: number
      doanhThuPhong: number
      theoNhanVien: { tenNhanVien: string; soLuong: number; giaTriTong: number }[]
    }

export interface HopDong {
  _id: string
  soHopDong?: string
  tenDoanhNghiep: string
  phong: string
  khuCongNghiep: string
  giaTriHopDong: number
  nguoiPhuTrach?: { _id: string; name: string; phong?: string } | null
  ngayKy?: string
  trangThai: string
  createdAt: string
}

export const PHONG_OPTIONS = [
  'Phòng Dịch vụ Tổng hợp, Đào tạo và Bồi dưỡng',
  'Phòng Dịch vụ Khoa học Công nghệ',
] as const

export const KHU_OPTIONS = [
  'CNC Hòa Lạc',
  'Khác',
  'Nội Bài',
  'Phú Nghĩa',
  'Quang Minh',
  'Sài Đồng',
  'Thăng Long',
  'Thạch Thất Quốc Oai',
] as const

export const getDashboard = () =>
  api.get<DashboardData>('/hop-dong/dashboard').then((r) => r.data)

export const getHopDongs = (params?: { page?: number; limit?: number; search?: string }) =>
  api.get('/hop-dong', { params }).then((r) => r.data)

export const createHopDong = (data: Omit<HopDong, '_id' | 'createdAt'>) =>
  api.post<HopDong>('/hop-dong', data).then((r) => r.data)

export const updateHopDong = (id: string, data: Partial<HopDong>) =>
  api.put<HopDong>(`/hop-dong/${id}`, data).then((r) => r.data)

export const deleteHopDong = (id: string) =>
  api.delete(`/hop-dong/${id}`).then((r) => r.data)

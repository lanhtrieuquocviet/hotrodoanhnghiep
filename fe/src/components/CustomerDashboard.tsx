import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts'
import { getDashboard, type DashboardData } from '../api/hopDong'
import './CustomerDashboard.css'

const formatVND = (v: number) =>
  v > 0 ? v.toLocaleString('vi-VN') + ' đ' : '0 đ'

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Không thể tải dữ liệu dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="cd-loading">Đang tải dữ liệu...</div>
  if (error)   return <div className="cd-error">{error}</div>
  if (!data)   return null

  if (data.viewType === 'theo-phong') return <PhongView data={data} />
  return <TongHopView data={data} />
}

/* ── VIEW TỔNG HỢP (Admin) ── */
function TongHopView({ data }: { data: Extract<DashboardData, { viewType: 'tong-hop' }> }) {
  return (
    <div className="cd-wrapper">
      <div className="cd-header-banner">
        <div className="cd-header-title">TRUNG TÂM DỊCH VỤ VÀ HỖ TRỢ DOANH NGHIỆP</div>
        <div className="cd-header-sub">DỮ LIỆU KHÁCH HÀNG – TỔNG HỢP</div>
      </div>

      <div className="cd-stat-row">
        <div className="cd-stat-box">
          <span className="cd-stat-label">Số doanh nghiệp thực hiện:</span>
          <span className="cd-stat-value">{data.tongDoanhNghiep}</span>
        </div>
        <div className="cd-stat-box">
          <span className="cd-stat-label">Tổng hợp đồng:</span>
          <span className="cd-stat-value">{data.tongHopDong}</span>
        </div>
      </div>

      {/* Hợp đồng theo phòng */}
      <section className="cd-section">
        <div className="cd-section-title">SỐ LƯỢNG HỢP ĐỒNG CỦA CÁC PHÒNG</div>
        <div className="cd-chart-table">
          <div className="cd-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.theoPhong} margin={{ top: 20, right: 20, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="phong" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [v, 'Số HĐ']} />
                <Bar dataKey="soLuong" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="soLuong" position="top" style={{ fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="cd-chart-xlabel">SỐ LƯỢNG HỢP ĐỒNG ĐÃ THỰC HIỆN</div>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr><th>Tên phòng</th><th>Số lượng HĐ</th><th>Giá trị HĐ</th></tr>
              </thead>
              <tbody>
                {data.theoPhong.map((row, i) => (
                  <tr key={row.phong}>
                    <td style={{ borderLeft: `4px solid ${['#2563eb','#3b82f6','#60a5fa'][i] ?? '#3b82f6'}` }}>
                      {row.phong}
                    </td>
                    <td className="cd-num">{row.soLuong}</td>
                    <td className="cd-num">{row.giaTriTong > 0 ? formatVND(row.giaTriTong) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Hợp đồng theo khu công nghiệp */}
      <section className="cd-section">
        <div className="cd-section-title">SỐ LƯỢNG HỢP ĐỒNG TRONG CÁC KHU CÔNG NGHIỆP</div>
        <div className="cd-chart-table">
          <div className="cd-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.theoKhuCongNghiep} margin={{ top: 20, right: 20, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="khuCongNghiep" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis
                  tick={{ fontSize: 12 }} allowDecimals={false}
                  label={{ value: 'Số lượng HĐ', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <Tooltip formatter={(v: number) => [v, 'Số HĐ']} />
                <Bar dataKey="soLuong" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="soLuong" position="top" style={{ fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="cd-chart-xlabel">TÊN KHU CÔNG NGHIỆP</div>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr><th>Tên khu công nghiệp</th><th>Số lượng</th><th>Loại</th></tr>
              </thead>
              <tbody>
                {data.theoKhuCongNghiep.map((row) => (
                  <tr key={row.khuCongNghiep}>
                    <td>{row.khuCongNghiep}</td>
                    <td className="cd-num">{row.soLuong}</td>
                    <td>Hợp đồng</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── VIEW THEO PHÒNG (Nhân viên) ── */
function PhongView({ data }: { data: Extract<DashboardData, { viewType: 'theo-phong' }> }) {
  return (
    <div className="cd-wrapper">
      <div className="cd-header-banner">
        <div className="cd-header-title">TRUNG TÂM DỊCH VỤ VÀ HỖ TRỢ DOANH NGHIỆP</div>
        <div className="cd-header-sub">PHÒNG {data.phong.toUpperCase()}</div>
      </div>

      <div className="cd-stat-row">
        <div className="cd-stat-box">
          <span className="cd-stat-label">Doanh thu của phòng:</span>
          <span className="cd-stat-value cd-stat-money">{formatVND(data.doanhThuPhong)}</span>
        </div>
        <div className="cd-stat-box">
          <span className="cd-stat-label">Số lượng hợp đồng thực hiện:</span>
          <span className="cd-stat-value">{data.tongHopDong}</span>
        </div>
      </div>

      {/* Hợp đồng theo nhân viên */}
      <section className="cd-section">
        <div className="cd-section-title">SỐ LƯỢNG HỢP ĐỒNG</div>
        <div className="cd-chart-table">
          <div className="cd-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.theoNhanVien} margin={{ top: 20, right: 20, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tenNhanVien" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v >= 1_000_000 ? (v / 1_000_000).toFixed(0) + 'M đ' : v + ' đ'}
                  label={{ value: 'Sản lượng', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <Tooltip formatter={(v: number) => [formatVND(v), 'Giá trị HĐ']} />
                <Bar dataKey="giaTriTong" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="giaTriTong"
                    position="top"
                    formatter={(v: number) => v > 0 ? formatVND(v) : ''}
                    style={{ fontSize: 10, fontWeight: 600, fill: '#1e40af' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="cd-chart-xlabel">NHÂN VIÊN PHỤ TRÁCH</div>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead>
                <tr><th>Họ tên</th><th>Số lượng HĐ</th><th>Giá trị HĐ</th></tr>
              </thead>
              <tbody>
                {data.theoNhanVien.map((row) => (
                  <tr key={row.tenNhanVien}>
                    <td>{row.tenNhanVien}</td>
                    <td className="cd-num">{row.soLuong}</td>
                    <td className="cd-num">{formatVND(row.giaTriTong)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

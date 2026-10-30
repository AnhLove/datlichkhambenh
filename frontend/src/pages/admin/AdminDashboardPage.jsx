import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Percent, RefreshCw, UserX, Wallet, XCircle } from 'lucide-react';

import { getAppointmentStatistics, getRevenueStatistics, getTopDoctors } from '../../services/statisticsService';
import { unwrapData, unwrapList } from '../../utils/unwrap';

import './AdminPage.css';

function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthRange() {
    const today = new Date();
    return {
        from: toDateString(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toDateString(today),
    };
}

function getLastDaysRange(days) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    return { from: toDateString(start), to: toDateString(today) };
}

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatMoney = (value) => `${formatNumber(value)} ₫`;

function AdminDashboardPage() {
    const [range, setRange] = useState(getMonthRange);
    const [appliedRange, setAppliedRange] = useState(getMonthRange);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadStatistics() {
            try {
                const [appointmentResponse, revenueResponse, topDoctorResponse] = await Promise.all([
                    getAppointmentStatistics(appliedRange.from, appliedRange.to),
                    getRevenueStatistics(appliedRange.from, appliedRange.to),
                    getTopDoctors(appliedRange.from, appliedRange.to),
                ]);

                if (cancelled) return;

                setData({
                    appointments: unwrapData(appointmentResponse) || {},
                    revenue: unwrapData(revenueResponse) || {},
                    topDoctors: unwrapList(topDoctorResponse),
                });
                setError('');
            } catch (err) {
                if (cancelled) return;
                setData(null);
                setError(err.message || 'Không thể tải số liệu thống kê.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadStatistics();

        return () => {
            cancelled = true;
        };
    }, [appliedRange]);

    const applyRange = (nextRange) => {
        if (!nextRange.from || !nextRange.to) {
            setError('Hãy chọn đủ ngày bắt đầu và ngày kết thúc.');
            return;
        }

        if (nextRange.from > nextRange.to) {
            setError('Ngày bắt đầu phải trước hoặc cùng ngày kết thúc.');
            return;
        }

        setRange(nextRange);
        setError('');
        setLoading(true);
        setAppliedRange({ ...nextRange });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        applyRange(range);
    };

    const appointments = data?.appointments;
    const total = Number(appointments?.totalAppointments || 0);
    const cancelled = Number(appointments?.cancelledAppointments || 0);
    // Tự tính tỷ lệ hủy từ số lượt để không phụ thuộc đơn vị của cancellationRate
    const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;

    const show = (value) => {
        if (loading) return '…';
        if (!data) return '—';
        return value;
    };

    const topDoctors = data?.topDoctors || [];
    const maxCompleted = topDoctors.reduce((max, item) => Math.max(max, Number(item.completedAppointments || 0)), 0);

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Thống kê hoạt động</h1>
                    <p>Số liệu lịch khám, doanh thu và bác sĩ nhiều lượt khám theo khoảng ngày.</p>
                </div>
            </div>

            <form className="admin-toolbar" onSubmit={handleSubmit}>
                <label className="admin-field">
                    <span>Từ ngày</span>
                    <input
                        type="date"
                        value={range.from}
                        max={range.to || undefined}
                        onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))}
                    />
                </label>

                <label className="admin-field">
                    <span>Đến ngày</span>
                    <input
                        type="date"
                        value={range.to}
                        min={range.from || undefined}
                        onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))}
                    />
                </label>

                <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                    <RefreshCw size={16} />
                    Xem thống kê
                </button>

                <div className="admin-toolbar__quick">
                    <button type="button" className="admin-btn" onClick={() => applyRange(getMonthRange())}>
                        Tháng này
                    </button>
                    <button type="button" className="admin-btn" onClick={() => applyRange(getLastDaysRange(7))}>
                        7 ngày qua
                    </button>
                    <button type="button" className="admin-btn" onClick={() => applyRange(getLastDaysRange(30))}>
                        30 ngày qua
                    </button>
                </div>
            </form>

            {error && (
                <p className="admin-alert admin-alert-error" role="alert">
                    {error}
                </p>
            )}

            <div className="admin-stats">
                <div className="admin-stat">
                    <span className="admin-stat__icon">
                        <CalendarDays size={22} />
                    </span>
                    <div>
                        <strong>{show(formatNumber(appointments?.totalAppointments))}</strong>
                        <span>Tổng lịch hẹn</span>
                    </div>
                </div>

                <div className="admin-stat">
                    <span className="admin-stat__icon admin-stat__icon-green">
                        <CheckCircle2 size={22} />
                    </span>
                    <div>
                        <strong>{show(formatNumber(appointments?.completedAppointments))}</strong>
                        <span>Lượt khám hoàn thành</span>
                    </div>
                </div>

                <div className="admin-stat">
                    <span className="admin-stat__icon admin-stat__icon-red">
                        <XCircle size={22} />
                    </span>
                    <div>
                        <strong>{show(formatNumber(appointments?.cancelledAppointments))}</strong>
                        <span>Lịch đã hủy</span>
                    </div>
                </div>

                <div className="admin-stat">
                    <span className="admin-stat__icon admin-stat__icon-amber">
                        <UserX size={22} />
                    </span>
                    <div>
                        <strong>{show(formatNumber(appointments?.noShowAppointments))}</strong>
                        <span>Bệnh nhân không đến</span>
                    </div>
                </div>

                <div className="admin-stat">
                    <span className="admin-stat__icon admin-stat__icon-red">
                        <Percent size={22} />
                    </span>
                    <div>
                        <strong>{show(`${cancelRate.toFixed(1)}%`)}</strong>
                        <span>Tỷ lệ hủy lịch</span>
                    </div>
                </div>

                <div className="admin-stat admin-stat-wide">
                    <span className="admin-stat__icon admin-stat__icon-green">
                        <Wallet size={22} />
                    </span>
                    <div>
                        <strong>{show(formatMoney(data?.revenue?.totalRevenue))}</strong>
                        <span>
                            Doanh thu · {show(formatNumber(data?.revenue?.paidTransactions))} giao dịch đã thanh toán
                        </span>
                    </div>
                </div>
            </div>

            <div className="admin-panel">
                <h2>Bác sĩ có nhiều lượt khám nhất</h2>

                {loading ? (
                    <p className="admin-empty">Đang tải...</p>
                ) : topDoctors.length === 0 ? (
                    <p className="admin-empty">Chưa có lượt khám hoàn thành trong khoảng ngày này.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="admin-col-rank">Hạng</th>
                                    <th>Bác sĩ</th>
                                    <th>Lượt khám hoàn thành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topDoctors.map((doctor, index) => {
                                    const count = Number(doctor.completedAppointments || 0);
                                    const percent = maxCompleted > 0 ? Math.round((count / maxCompleted) * 100) : 0;

                                    return (
                                        <tr key={doctor.doctorId ?? index}>
                                            <td className="admin-col-rank">{index + 1}</td>
                                            <td>{doctor.doctorName}</td>
                                            <td>
                                                <div className="admin-bar">
                                                    <span
                                                        className="admin-bar__fill"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                    <strong>{formatNumber(count)}</strong>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminDashboardPage;

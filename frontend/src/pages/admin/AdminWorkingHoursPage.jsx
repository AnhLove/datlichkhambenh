import { useEffect, useState } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';

import { searchDoctors } from '../../services/doctorService';
import { getWorkingHoursByStatus, updateWorkingHourStatus } from '../../services/workingHourService';
import { unwrapList } from '../../utils/unwrap';

import './AdminPage.css';

const STATUS_PENDING = 1;
const STATUS_APPROVED = 2;
const STATUS_REJECTED = 3;

const TABS = [
    { value: STATUS_PENDING, label: 'Chờ duyệt' },
    { value: STATUS_APPROVED, label: 'Đã duyệt' },
    { value: STATUS_REJECTED, label: 'Từ chối' },
];

const DAYS = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 7: 'Chủ nhật' };
const SHIFTS = { 1: 'Cả ngày', 2: 'Buổi sáng', 3: 'Buổi chiều', 4: 'Nghỉ' };

function AdminWorkingHoursPage() {
    const [status, setStatus] = useState(STATUS_PENDING);
    const [items, setItems] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const doctorByUuid = new Map(doctors.map((doctor) => [doctor.uuid, doctor]));

    const getDoctorName = (item) => doctorByUuid.get(item.uuid)?.fullName || '—';

    useEffect(() => {
        let cancelled = false;

        async function loadItems() {
            try {
                const [response, doctorResponse] = await Promise.all([
                    getWorkingHoursByStatus(status),
                    searchDoctors('', ''),
                ]);
                if (cancelled) return;
                setItems(unwrapList(response));
                setDoctors(unwrapList(doctorResponse));
                setLoadError('');
            } catch (err) {
                if (cancelled) return;
                setItems([]);
                setLoadError(err.message || 'Không thể tải lịch làm việc.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadItems();

        return () => {
            cancelled = true;
        };
    }, [status, reloadKey]);

    const handleTabChange = (value) => {
        if (value === status) return;
        setLoading(true);
        setNotice('');
        setLoadError('');
        setStatus(value);
    };

    const handleRefresh = () => {
        setLoading(true);
        setNotice('');
        setReloadKey((key) => key + 1);
    };

    const handleChangeStatus = async (item, nextStatus) => {
        const action = nextStatus === STATUS_APPROVED ? 'Duyệt' : 'Từ chối';
        const confirmed = window.confirm(
            `${action} lịch làm việc ${DAYS[Number(item.dayOfWeek)] || ''} của ${getDoctorName(item)}?`
        );
        if (!confirmed) return;

        setProcessingId(item.id);
        setLoadError('');

        try {
            await updateWorkingHourStatus(item.id, nextStatus);
            setNotice(nextStatus === STATUS_APPROVED ? 'Đã duyệt lịch làm việc.' : 'Đã từ chối lịch làm việc.');
            setReloadKey((key) => key + 1);
        } catch (err) {
            setNotice('');
            setLoadError(err.message || 'Không thể cập nhật trạng thái lịch làm việc.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <section className="admin-page">
            <div className="admin-page__heading">
                <div>
                    <h1>Duyệt lịch làm việc</h1>
                    <p>
                        Bác sĩ chỉ có khung giờ trống cho bệnh nhân sau khi lịch làm việc được duyệt. Lịch đã xử lý
                        không đổi lại được, bác sĩ phải gửi lại để chờ duyệt.
                    </p>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-toolbar__quick" style={{ marginLeft: 0 }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            className={`admin-btn ${status === tab.value ? 'admin-btn-primary' : ''}`}
                            onClick={() => handleTabChange(tab.value)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button type="button" className="admin-btn" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {notice && (
                <p className="admin-alert admin-alert-success" role="status">
                    {notice}
                </p>
            )}

            {loadError && (
                <p className="admin-alert admin-alert-error" role="alert">
                    {loadError}
                </p>
            )}

            <div className="admin-panel">
                {loading ? (
                    <p className="admin-empty">Đang tải...</p>
                ) : items.length === 0 ? (
                    <p className="admin-empty">Không có lịch làm việc nào ở trạng thái này.</p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Bác sĩ</th>
                                    <th>Chuyên khoa</th>
                                    <th>Thứ</th>
                                    <th>Ca làm việc</th>
                                    <th className="admin-col-actions">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{getDoctorName(item)}</strong>
                                        </td>
                                        <td>{doctorByUuid.get(item.uuid)?.departmentName || '—'}</td>
                                        <td>{DAYS[Number(item.dayOfWeek)] || '—'}</td>
                                        <td>{SHIFTS[Number(item.shiftType)] || '—'}</td>
                                        <td className="admin-col-actions">
                                            {status === STATUS_PENDING && (
                                                <button
                                                    type="button"
                                                    className="admin-icon-btn"
                                                    title="Duyệt"
                                                    aria-label={`Duyệt lịch của ${getDoctorName(item)}`}
                                                    onClick={() => handleChangeStatus(item, STATUS_APPROVED)}
                                                    disabled={processingId === item.id}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}

                                            {status === STATUS_PENDING && (
                                                <button
                                                    type="button"
                                                    className="admin-icon-btn admin-icon-btn-danger"
                                                    title="Từ chối"
                                                    aria-label={`Từ chối lịch của ${getDoctorName(item)}`}
                                                    onClick={() => handleChangeStatus(item, STATUS_REJECTED)}
                                                    disabled={processingId === item.id}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminWorkingHoursPage;

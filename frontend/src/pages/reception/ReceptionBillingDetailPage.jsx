import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Receipt,
    UserRound,
    Stethoscope,
    Clock3,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Printer,
    Plus,
} from 'lucide-react';

import { getMedicalServices } from '../../services/medicalService';
import {
    getAppointmentsByDate,
    getAppointmentServices,
    addAppointmentService,
    removeAppointmentService,
    getPaymentByAppointment,
    createPayment,
    confirmPayment,
} from '../../services/receptionService';
import { unwrapData, unwrapList } from '../../utils/unwrap';
import '../../styles/staff-portal.css';
import './ReceptionPages.css';

// Thu tại quầy: tiền mặt, chuyển khoản, thẻ. VNPay sẽ làm riêng sau.
const COUNTER_METHODS = [
    { value: 1, label: 'Tiền mặt' },
    { value: 2, label: 'Chuyển khoản' },
    { value: 3, label: 'Thẻ' },
];

const METHOD_LABEL = { 1: 'Tiền mặt', 2: 'Chuyển khoản', 3: 'Thẻ', 4: 'VNPay' };

const PAYMENT_STATUS = {
    1: { label: 'Chờ thanh toán', className: 'pending' },
    2: { label: 'Đã thanh toán', className: 'confirmed' },
    3: { label: 'Thanh toán thất bại', className: 'cancelled' },
};

const MAX_QUANTITY = 20;

function formatMoney(value) {
    return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} VNĐ`;
}

function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Danh sách dịch vụ công khai cần có trường id để gắn vào lịch hẹn
function getServiceId(service) {
    return service?.id ?? service?.serviceId ?? null;
}

function ReceptionBillingDetailPage() {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const date = searchParams.get('date') || '';

    const [appointment, setAppointment] = useState(null);
    const [services, setServices] = useState([]);
    const [payment, setPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const [catalog, setCatalog] = useState([]);
    const [catalogError, setCatalogError] = useState('');
    const [showAllServices, setShowAllServices] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [method, setMethod] = useState('1');

    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const [dayResponse, serviceResponse, paymentResponse] = await Promise.all([
                    date ? getAppointmentsByDate(date) : Promise.resolve(null),
                    getAppointmentServices(appointmentId),
                    // Lịch chưa có khoản thu thì backend báo lỗi, coi như chưa có
                    getPaymentByAppointment(appointmentId).catch(() => null),
                ]);

                if (cancelled) return;

                const found = unwrapList(dayResponse).find(
                    (item) => String(item.appointmentId) === String(appointmentId)
                );

                setAppointment(found ?? null);
                setServices(unwrapList(serviceResponse));
                setPayment(paymentResponse ? unwrapData(paymentResponse) : null);
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải thông tin thu ngân.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [appointmentId, date, reloadKey]);

    useEffect(() => {
        let cancelled = false;

        async function loadCatalog() {
            try {
                const response = await getMedicalServices();
                if (!cancelled) setCatalog(unwrapList(response));
            } catch (err) {
                if (!cancelled) setCatalogError(err?.message || 'Không thể tải danh sách dịch vụ.');
            }
        }

        loadCatalog();

        return () => {
            cancelled = true;
        };
    }, []);

    const reload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const addedIds = useMemo(() => new Set(services.map((item) => Number(item.serviceId))), [services]);

    const catalogHasIds = catalog.length === 0 || catalog.some((service) => getServiceId(service) != null);

    const options = useMemo(() => {
        const department = appointment?.departmentName;

        return catalog
            .filter((service) => {
                const id = getServiceId(service);
                if (id == null || addedIds.has(Number(id))) return false;
                return showAllServices || !department || service.departmentName === department;
            })
            .sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'));
    }, [catalog, addedIds, showAllServices, appointment]);

    const total = services.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
    const paymentStatus = payment ? Number(payment.status) : null;
    const isPaid = paymentStatus === 2;
    const isLocked = Boolean(payment); // đã có khoản thu thì không đổi dịch vụ nữa
    const statusCode = Number(appointment?.status);
    const isBillable = statusCode === 3 || statusCode === 4;

    const run = async (task, successText) => {
        try {
            setBusy(true);
            setActionError('');
            setSuccessMessage('');

            await task();

            setSuccessMessage(successText);
            reload();
        } catch (err) {
            setActionError(err?.message || 'Thao tác thất bại.');
        } finally {
            setBusy(false);
        }
    };

    const handleAddService = async (event) => {
        event.preventDefault();

        if (!selectedServiceId) {
            setActionError('Vui lòng chọn dịch vụ.');
            return;
        }

        if (!/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > MAX_QUANTITY) {
            setActionError(`Số lượng phải từ 1 đến ${MAX_QUANTITY}.`);
            return;
        }

        await run(
            () =>
                addAppointmentService({
                    appointmentId: Number(appointmentId),
                    serviceId: Number(selectedServiceId),
                    quantity: Number(quantity),
                }),
            'Đã thêm dịch vụ vào lịch khám.'
        );

        setSelectedServiceId('');
        setQuantity('1');
    };

    const handleRemoveService = async (item) => {
        if (!window.confirm(`Xóa dịch vụ "${item.serviceName}" khỏi lịch khám?`)) return;

        await run(
            () => removeAppointmentService(Number(appointmentId), item.serviceId),
            'Đã xóa dịch vụ khỏi lịch khám.'
        );
    };

    const handleCreatePayment = async () => {
        const confirmed = window.confirm(
            `Tạo khoản thu ${formatMoney(total)}? Sau khi tạo, không thể thêm hoặc xóa dịch vụ của lịch này.`
        );

        if (!confirmed) return;

        await run(
            () => createPayment(Number(appointmentId), Number(method)),
            'Đã tạo khoản thu. Hãy xác nhận khi đã nhận tiền.'
        );
    };

    const handleConfirmPayment = async () => {
        if (!window.confirm(`Xác nhận đã nhận ${formatMoney(payment?.amount)} từ bệnh nhân?`)) return;

        await run(() => confirmPayment(Number(appointmentId)), 'Đã xác nhận thanh toán.');
    };

    const backLink = `/reception/billing${date ? `?date=${date}` : ''}`;
    const paymentBadge = payment ? PAYMENT_STATUS[paymentStatus] : null;

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero reception-no-print">
                <div>
                    <span className="doctor-page-eyebrow">
                        <Receipt size={16} />
                        QUẦY THU NGÂN
                    </span>
                    <h1>Thu ngân lịch #{appointmentId}</h1>
                    <p>Thêm dịch vụ đã thực hiện, tạo khoản thu, xác nhận thanh toán và in hóa đơn.</p>
                </div>
                <Receipt className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            <section className="doctor-panel reception-no-print">
                <Link to={backLink} className="reception-back">
                    <ArrowLeft size={17} />
                    Quay lại danh sách thu ngân
                </Link>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải thông tin</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải thông tin</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={reload}>
                            Thử lại
                        </button>
                    </div>
                ) : !appointment ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không tìm thấy lịch hẹn</h3>
                        <p>Hãy mở lại từ danh sách thu ngân để có đủ thông tin ngày khám.</p>
                    </div>
                ) : (
                    <>
                        <div className="reception-patient-box">
                            <span className="doctor-summary-icon">
                                <UserRound size={21} />
                            </span>
                            <div>
                                <small>Bệnh nhân</small>
                                <strong>{appointment.patientName || 'Chưa có thông tin'}</strong>
                                <span>
                                    {[
                                        appointment.patientPhone,
                                        `Khám ${appointment.timeSlot ?? ''} ngày ${formatDate(appointment.appointmentDate)}`,
                                        appointment.doctorName,
                                        appointment.departmentName,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </div>
                        </div>

                        {!isBillable && (
                            <p className="doctor-feedback doctor-feedback-error" role="alert">
                                <AlertCircle size={17} />
                                Chỉ lịch đã check-in hoặc đã hoàn thành mới thu ngân được.
                            </p>
                        )}

                        {successMessage && (
                            <p className="doctor-feedback doctor-feedback-success" role="status">
                                <CheckCircle2 size={18} /> {successMessage}
                            </p>
                        )}
                        {actionError && (
                            <p className="doctor-feedback doctor-feedback-error" role="alert">
                                <AlertCircle size={18} /> {actionError}
                            </p>
                        )}

                        <h2 className="reception-section-title">Dịch vụ</h2>

                        {services.length === 0 ? (
                            <p className="reception-hint">Lịch này chưa có dịch vụ nào. Thêm dịch vụ để tính tiền.</p>
                        ) : (
                            <div className="reception-table-wrap">
                                <table className="reception-table">
                                    <thead>
                                        <tr>
                                            <th>Dịch vụ</th>
                                            <th className="reception-num">Đơn giá</th>
                                            <th className="reception-num">SL</th>
                                            <th className="reception-num">Thành tiền</th>
                                            <th aria-label="Thao tác" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.serviceName}</td>
                                                <td className="reception-num">{formatMoney(item.priceAtTime)}</td>
                                                <td className="reception-num">{item.quantity}</td>
                                                <td className="reception-num">{formatMoney(item.totalPrice)}</td>
                                                <td className="reception-num">
                                                    <button
                                                        type="button"
                                                        className="reception-icon-button"
                                                        onClick={() => handleRemoveService(item)}
                                                        disabled={busy || isLocked}
                                                        aria-label={`Xóa ${item.serviceName}`}
                                                        title={
                                                            isLocked ? 'Đã tạo khoản thu, không thể xóa' : 'Xóa dịch vụ'
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3}>
                                                <strong>Tổng cộng</strong>
                                            </td>
                                            <td className="reception-num">
                                                <strong>{formatMoney(total)}</strong>
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {!isLocked && isBillable && (
                            <form className="reception-add-service" onSubmit={handleAddService}>
                                {catalogError && (
                                    <p className="doctor-feedback doctor-feedback-error" role="alert">
                                        <AlertCircle size={17} />
                                        {catalogError}
                                    </p>
                                )}
                                {!catalogHasIds && (
                                    <p className="doctor-feedback doctor-feedback-error" role="alert">
                                        <AlertCircle size={17} />
                                        Dữ liệu dịch vụ thiếu mã định danh (id), chưa thể thêm dịch vụ vào lịch.
                                    </p>
                                )}

                                <div className="reception-add-service-row">
                                    <label className="reception-input reception-add-service-select">
                                        <span>Thêm dịch vụ</span>
                                        <select
                                            value={selectedServiceId}
                                            onChange={(event) => setSelectedServiceId(event.target.value)}
                                            disabled={busy || options.length === 0}
                                        >
                                            <option value="">
                                                {options.length === 0 ? 'Không còn dịch vụ để thêm' : 'Chọn dịch vụ'}
                                            </option>
                                            {options.map((service) => (
                                                <option
                                                    key={getServiceId(service)}
                                                    value={String(getServiceId(service))}
                                                >
                                                    {service.name} — {formatMoney(service.price)}
                                                    {showAllServices ? ` (${service.departmentName})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="reception-input reception-add-service-qty">
                                        <span>Số lượng</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={MAX_QUANTITY}
                                            value={quantity}
                                            onChange={(event) => setQuantity(event.target.value)}
                                            disabled={busy}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="doctor-primary-button"
                                        disabled={busy || !selectedServiceId}
                                    >
                                        <Plus size={16} />
                                        Thêm
                                    </button>
                                </div>

                                <label className="reception-check">
                                    <input
                                        type="checkbox"
                                        checked={showAllServices}
                                        onChange={(event) => {
                                            setShowAllServices(event.target.checked);
                                            setSelectedServiceId('');
                                        }}
                                    />
                                    <span>Hiện dịch vụ của tất cả chuyên khoa</span>
                                </label>
                            </form>
                        )}

                        <h2 className="reception-section-title">Thanh toán</h2>

                        {!payment ? (
                            <div className="reception-payment-box">
                                <p>
                                    Chưa có khoản thu. Tổng tạm tính: <strong>{formatMoney(total)}</strong>
                                </p>

                                <div className="reception-add-service-row">
                                    <label className="reception-input reception-add-service-select">
                                        <span>Phương thức thanh toán</span>
                                        <select
                                            value={method}
                                            onChange={(event) => setMethod(event.target.value)}
                                            disabled={busy}
                                        >
                                            {COUNTER_METHODS.map((item) => (
                                                <option key={item.value} value={String(item.value)}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <button
                                        type="button"
                                        className="doctor-primary-button"
                                        onClick={handleCreatePayment}
                                        disabled={busy || !isBillable || services.length === 0}
                                    >
                                        <Receipt size={16} />
                                        Tạo khoản thu
                                    </button>
                                </div>

                                {services.length === 0 && (
                                    <p className="reception-hint">
                                        Cần thêm ít nhất một dịch vụ trước khi tạo khoản thu.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="reception-payment-box">
                                <div className="doctor-appointment-details">
                                    <div>
                                        <Receipt size={18} />
                                        <span>
                                            <small>Số tiền</small>
                                            <strong>{formatMoney(payment.amount)}</strong>
                                        </span>
                                    </div>
                                    <div>
                                        <Stethoscope size={18} />
                                        <span>
                                            <small>Phương thức</small>
                                            <strong>{METHOD_LABEL[Number(payment.method)] ?? '—'}</strong>
                                        </span>
                                    </div>
                                    <div>
                                        <CheckCircle2 size={18} />
                                        <span>
                                            <small>Trạng thái</small>
                                            <strong>
                                                <span
                                                    className={`doctor-status doctor-status-${paymentBadge?.className ?? 'unknown'}`}
                                                >
                                                    {paymentBadge?.label ?? 'Không xác định'}
                                                </span>
                                            </strong>
                                        </span>
                                    </div>
                                    <div>
                                        <Clock3 size={18} />
                                        <span>
                                            <small>Thanh toán lúc</small>
                                            <strong>{formatDateTime(payment.paidAt)}</strong>
                                        </span>
                                    </div>
                                </div>

                                {paymentStatus === 1 && (
                                    <div className="doctor-appointment-actions reception-actions">
                                        <button
                                            type="button"
                                            className="doctor-primary-button"
                                            onClick={handleConfirmPayment}
                                            disabled={busy}
                                        >
                                            <CheckCircle2 size={16} />
                                            {busy ? 'Đang xử lý...' : 'Xác nhận đã thu tiền'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>

            {appointment && isPaid && (
                <section className="doctor-panel">
                    <div className="doctor-panel-heading reception-no-print">
                        <div>
                            <h2>Hóa đơn</h2>
                            <p>Kiểm tra thông tin rồi in cho bệnh nhân.</p>
                        </div>
                        <button type="button" className="doctor-primary-button" onClick={() => window.print()}>
                            <Printer size={16} />
                            In hóa đơn
                        </button>
                    </div>

                    <article className="reception-invoice">
                        <header className="reception-invoice-head">
                            <h3>BỆNH VIỆN NAM LƯƠNG SƠN</h3>
                            <p className="reception-invoice-title">HÓA ĐƠN KHÁM BỆNH</p>
                            <p>Số: HD{String(appointmentId).padStart(6, '0')}</p>
                        </header>

                        <dl className="reception-invoice-info">
                            <div>
                                <dt>Bệnh nhân</dt>
                                <dd>{payment?.patientName || appointment.patientName}</dd>
                            </div>
                            <div>
                                <dt>Điện thoại</dt>
                                <dd>{appointment.patientPhone || '—'}</dd>
                            </div>
                            <div>
                                <dt>Bác sĩ</dt>
                                <dd>{payment?.doctorName || appointment.doctorName}</dd>
                            </div>
                            <div>
                                <dt>Chuyên khoa</dt>
                                <dd>{appointment.departmentName || '—'}</dd>
                            </div>
                            <div>
                                <dt>Ngày khám</dt>
                                <dd>
                                    {formatDate(payment?.appointmentDate || appointment.appointmentDate)} ·{' '}
                                    {appointment.timeSlot}
                                </dd>
                            </div>
                            <div>
                                <dt>Phương thức</dt>
                                <dd>{METHOD_LABEL[Number(payment?.method)] ?? '—'}</dd>
                            </div>
                            <div>
                                <dt>Thanh toán lúc</dt>
                                <dd>{formatDateTime(payment?.paidAt)}</dd>
                            </div>
                        </dl>

                        <table className="reception-table reception-invoice-table">
                            <thead>
                                <tr>
                                    <th>Dịch vụ</th>
                                    <th className="reception-num">Đơn giá</th>
                                    <th className="reception-num">SL</th>
                                    <th className="reception-num">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.serviceName}</td>
                                        <td className="reception-num">{formatMoney(item.priceAtTime)}</td>
                                        <td className="reception-num">{item.quantity}</td>
                                        <td className="reception-num">{formatMoney(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3}>
                                        <strong>Tổng cộng</strong>
                                    </td>
                                    <td className="reception-num">
                                        <strong>{formatMoney(payment?.amount ?? total)}</strong>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        <p className="reception-invoice-foot">Cảm ơn quý khách đã sử dụng dịch vụ.</p>
                    </article>
                </section>
            )}
        </main>
    );
}

export default ReceptionBillingDetailPage;

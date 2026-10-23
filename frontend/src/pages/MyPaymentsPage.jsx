import { useEffect, useState } from 'react';
import {
    CreditCard,
    CalendarDays,
    Stethoscope,
    Clock3,
    ReceiptText,
    RefreshCw,
    AlertCircle,
    CircleDollarSign,
} from 'lucide-react';

import { getMyPayments } from '../services/paymentService';
import './MyPaymentsPage.css';

function getPaymentList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;

    return [];
}

function formatDate(value) {
    if (!value) return 'Chưa có thông tin';

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatDateTime(value) {
    if (!value) return 'Chưa thanh toán';

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

function formatAmount(value) {
    if (value === null || value === undefined || value === '') {
        return 'Chưa có thông tin';
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return 'Chưa có thông tin';

    return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
}

function getMethodLabel(method) {
    if (method === null || method === undefined) {
        return 'Chưa có thông tin';
    }

    const labels = {
        1: 'Phương thức 1',
        2: 'Phương thức 2',
        3: 'Phương thức 3',
    };

    return labels[String(method)] || `Phương thức ${method}`;
}

function getPaymentStatus(status) {
    if (status === null || status === undefined) {
        return { label: 'Chưa xác định', className: 'unknown' };
    }

    const labels = {
        1: { label: 'Trạng thái 1', className: 'pending' },
        2: { label: 'Trạng thái 2', className: 'paid' },
        3: { label: 'Trạng thái 3', className: 'failed' },
    };

    return (
        labels[String(status)] || {
            label: `Trạng thái ${status}`,
            className: 'unknown',
        }
    );
}

function MyPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getMyPayments()
            .then((response) => {
                if (cancelled) return;

                setPayments(getPaymentList(response));
                setError('');
            })
            .catch((err) => {
                if (cancelled) return;

                setError(err?.message || 'Không thể tải lịch sử thanh toán. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleRetry = () => {
        setError('');
        setIsLoading(true);
        setReloadKey((key) => key + 1);
    };

    const totalPayments = payments.length;

    const totalPaid = payments.reduce((total, payment) => {
        return total + (Number(payment.status) === 2 ? Number(payment.amount) || 0 : 0);
    }, 0);

    return (
        <main className="my-payments-page">
            <section className="my-payments-hero">
                <div className="my-payments-hero-content">
                    <span className="my-payments-eyebrow">
                        <ReceiptText size={16} />
                        QUẢN LÝ THANH TOÁN
                    </span>

                    <h1>Lịch sử thanh toán</h1>

                    <p>Theo dõi các khoản thanh toán liên quan đến lịch khám của bạn tại Bệnh viện Nam Lương Sơn.</p>
                </div>

                <div className="my-payments-hero-icon" aria-hidden="true">
                    <CreditCard size={70} strokeWidth={1.3} />
                </div>
            </section>

            <section className="payment-summary" aria-label="Tổng quan thanh toán">
                <article className="payment-summary-card">
                    <span className="payment-summary-icon payment-total-icon">
                        <ReceiptText size={22} />
                    </span>
                    <div>
                        <p>Tổng khoản thanh toán</p>
                        <strong>{totalPayments}</strong>
                    </div>
                </article>

                <article className="payment-summary-card">
                    <span className="payment-summary-icon payment-amount-icon">
                        <CircleDollarSign size={22} />
                    </span>
                    <div>
                        <p>Tổng tiền đã thanh toán</p>
                        <strong>{formatAmount(totalPaid)}</strong>
                    </div>
                </article>
            </section>

            <section className="payment-list-section">
                <div className="payment-list-heading">
                    <div>
                        <h2>Các khoản thanh toán</h2>
                        <p>Thông tin thanh toán của tài khoản đang đăng nhập</p>
                    </div>

                    <button type="button" className="payment-refresh-button" onClick={handleRetry} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'payment-refresh-spinning' : ''} />
                        Làm mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="payment-state" role="status" aria-live="polite">
                        <span className="payment-spinner" />
                        <h3>Đang tải lịch sử thanh toán</h3>
                        <p>Vui lòng đợi trong giây lát...</p>
                    </div>
                ) : error ? (
                    <div className="payment-state payment-error-state">
                        <span className="payment-state-icon">
                            <AlertCircle size={30} />
                        </span>
                        <h3>Không thể tải lịch sử thanh toán</h3>
                        <p>{error}</p>
                        <button type="button" className="payment-primary-button" onClick={handleRetry}>
                            <RefreshCw size={16} />
                            Thử lại
                        </button>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="payment-state">
                        <span className="payment-state-icon">
                            <CreditCard size={32} />
                        </span>
                        <h3>Chưa có khoản thanh toán nào</h3>
                        <p>Các khoản thanh toán liên quan đến lịch khám của bạn sẽ hiển thị tại đây khi có dữ liệu.</p>
                    </div>
                ) : (
                    <div className="payment-list">
                        {payments.map((payment, index) => {
                            const status = getPaymentStatus(payment.status);

                            return (
                                <article
                                    className="payment-card"
                                    key={
                                        payment.transactionCode ||
                                        `${payment.appointmentDate}-${payment.amount}-${index}`
                                    }
                                >
                                    <div className="payment-card-top">
                                        <div className="payment-card-title">
                                            <span className="payment-card-icon">
                                                <CreditCard size={21} />
                                            </span>

                                            <div>
                                                <span className="payment-field-label">Mã giao dịch</span>
                                                <strong>{payment.transactionCode || 'Chưa có mã giao dịch'}</strong>
                                            </div>
                                        </div>

                                        <span className={`payment-status payment-status-${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="payment-amount">
                                        <span>Số tiền</span>
                                        <strong>{formatAmount(payment.amount)}</strong>
                                    </div>

                                    <div className="payment-card-details">
                                        <div className="payment-detail">
                                            <Stethoscope size={18} />
                                            <div>
                                                <span className="payment-field-label">Bác sĩ</span>
                                                <strong>{payment.doctorName || 'Chưa có thông tin'}</strong>
                                            </div>
                                        </div>

                                        <div className="payment-detail">
                                            <CalendarDays size={18} />
                                            <div>
                                                <span className="payment-field-label">Ngày khám</span>
                                                <strong>{formatDate(payment.appointmentDate)}</strong>
                                            </div>
                                        </div>

                                        <div className="payment-detail">
                                            <CreditCard size={18} />
                                            <div>
                                                <span className="payment-field-label">Phương thức</span>
                                                <strong>{getMethodLabel(payment.method)}</strong>
                                            </div>
                                        </div>

                                        <div className="payment-detail">
                                            <Clock3 size={18} />
                                            <div>
                                                <span className="payment-field-label">Thời gian thanh toán</span>
                                                <strong>{formatDateTime(payment.paidAt)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyPaymentsPage;

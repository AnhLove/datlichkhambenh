import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    UserRound,
    UserPlus,
    Mail,
    CalendarDays,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Search,
    X,
} from 'lucide-react';
import { getAllUsers, createPatient } from '../services/receptionService';
import { unwrapList } from '../utils/unwrap';
import { getTodayString } from '../utils/date';
import './DoctorAppointmentsPage.css';
import './ReceptionPages.css';

// Giống các ràng buộc ở CreateUserRequest của backend
const PHONE_REGEX = /^(0|\+84)\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_VISIBLE = 50;

const EMPTY_FORM = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    dateOfBirth: '',
};

function formatDob(value) {
    if (!value) return 'Chưa có thông tin';
    const [year, month, day] = String(value).split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
}

function validateForm(form) {
    if (!form.fullName.trim()) return 'Vui lòng nhập họ tên.';
    if (form.fullName.trim().length > 150) return 'Họ tên không được vượt quá 150 ký tự.';
    if (!PHONE_REGEX.test(form.phone.trim())) return 'Số điện thoại không đúng định dạng (ví dụ 0901234567).';
    if (!EMAIL_REGEX.test(form.email.trim())) return 'Email không đúng định dạng.';
    if (form.password.length < 8 || form.password.length > 72) return 'Mật khẩu phải từ 8 đến 72 ký tự.';
    if (!form.dateOfBirth) return 'Vui lòng chọn ngày sinh.';
    if (form.dateOfBirth >= getTodayString()) return 'Ngày sinh phải là một ngày trong quá khứ.';
    return '';
}

function ReceptionPatientsPage() {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadPatients() {
            try {
                const response = await getAllUsers();
                if (cancelled) return;
                // Backend trả mọi vai trò, chỉ giữ bệnh nhân (role = 1)
                setPatients(unwrapList(response).filter((user) => Number(user.role) === 1));
                setError('');
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Không thể tải danh sách bệnh nhân.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadPatients();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const filteredPatients = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return patients;

        return patients.filter(
            (patient) =>
                String(patient.fullName ?? '')
                    .toLowerCase()
                    .includes(keyword) ||
                String(patient.phone ?? '').includes(keyword) ||
                String(patient.email ?? '')
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [patients, searchTerm]);

    const visiblePatients = filteredPatients.slice(0, MAX_VISIBLE);

    const reload = () => {
        setIsLoading(true);
        setError('');
        setReloadKey((key) => key + 1);
    };

    const openForm = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setSuccessMessage('');
        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (isSubmitting) return;
        setIsFormOpen(false);
        setFormError('');
    };

    const updateField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const message = validateForm(form);
        if (message) {
            setFormError(message);
            return;
        }

        try {
            setIsSubmitting(true);
            setFormError('');

            await createPatient({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                password: form.password,
                dateOfBirth: form.dateOfBirth,
            });

            setIsFormOpen(false);
            setSuccessMessage(
                `Đã tạo hồ sơ cho ${form.fullName.trim()}. Hãy báo email đăng nhập và mật khẩu tạm cho bệnh nhân.`
            );
            setSearchTerm(form.phone.trim());
            reload();
        } catch (err) {
            setFormError(err?.message || 'Không thể tạo hồ sơ bệnh nhân.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="doctor-appointments-page">
            <section className="doctor-page-hero">
                <div>
                    <span className="doctor-page-eyebrow">
                        <Users size={16} />
                        QUẦY TIẾP ĐÓN
                    </span>
                    <h1>Hồ sơ bệnh nhân</h1>
                    <p>Tìm bệnh nhân theo tên, số điện thoại hoặc email, hoặc tạo nhanh hồ sơ mới tại quầy.</p>
                </div>
                <Users className="doctor-page-hero-icon" size={64} strokeWidth={1.3} />
            </section>

            {successMessage && (
                <p className="doctor-feedback doctor-feedback-success" role="status">
                    <CheckCircle2 size={18} /> {successMessage}
                </p>
            )}

            <section className="doctor-panel">
                <div className="doctor-panel-heading">
                    <div>
                        <h2>Danh sách bệnh nhân</h2>
                        <p>Tổng cộng {patients.length} bệnh nhân.</p>
                    </div>
                    <div className="reception-actions">
                        <button type="button" className="doctor-secondary-button" onClick={reload} disabled={isLoading}>
                            <RefreshCw size={16} className={isLoading ? 'doctor-spin' : ''} />
                            Làm mới
                        </button>
                        <button type="button" className="doctor-primary-button" onClick={openForm}>
                            <UserPlus size={16} />
                            Tạo hồ sơ mới
                        </button>
                    </div>
                </div>

                <div className="doctor-filters">
                    <label className="doctor-search-field">
                        <Search size={17} />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm theo tên, số điện thoại hoặc email..."
                            aria-label="Tìm bệnh nhân"
                        />
                    </label>
                </div>

                {isLoading ? (
                    <div className="doctor-state" role="status">
                        <span className="doctor-spinner" />
                        <h3>Đang tải danh sách bệnh nhân</h3>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                ) : error ? (
                    <div className="doctor-state doctor-state-error">
                        <AlertCircle size={30} />
                        <h3>Không thể tải danh sách</h3>
                        <p>{error}</p>
                        <button type="button" className="doctor-primary-button" onClick={reload}>
                            Thử lại
                        </button>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="doctor-state">
                        <UserRound size={34} />
                        <h3>Không tìm thấy bệnh nhân</h3>
                        <p>Thử từ khóa khác hoặc bấm &quot;Tạo hồ sơ mới&quot; nếu đây là bệnh nhân mới.</p>
                    </div>
                ) : (
                    <>
                        {filteredPatients.length > MAX_VISIBLE && (
                            <p className="reception-toolbar-note">
                                Hiển thị {MAX_VISIBLE} kết quả đầu trong {filteredPatients.length}. Hãy nhập thêm từ
                                khóa để thu hẹp.
                            </p>
                        )}
                        <div className="doctor-appointment-list">
                            {visiblePatients.map((patient) => {
                                const isLocked = Number(patient.status) === 1;

                                return (
                                    <article className="doctor-appointment-card" key={patient.uuid}>
                                        <div className="doctor-appointment-top">
                                            <div>
                                                <span className="doctor-field-label">Bệnh nhân</span>
                                                <h3>{patient.fullName}</h3>
                                            </div>
                                            <span
                                                className={`doctor-status doctor-status-${isLocked ? 'cancelled' : 'confirmed'}`}
                                            >
                                                {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                                            </span>
                                        </div>

                                        <div className="doctor-appointment-details">
                                            <div>
                                                <UserRound size={18} />
                                                <span>
                                                    <small>Số điện thoại</small>
                                                    <strong>{patient.phone || 'Chưa có thông tin'}</strong>
                                                </span>
                                            </div>
                                            <div>
                                                <Mail size={18} />
                                                <span>
                                                    <small>Email</small>
                                                    <strong>{patient.email || 'Chưa có thông tin'}</strong>
                                                </span>
                                            </div>
                                            <div>
                                                <CalendarDays size={18} />
                                                <span>
                                                    <small>Ngày sinh</small>
                                                    <strong>{formatDob(patient.dateOfBirth)}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        {!isLocked && (
                                            <div className="doctor-appointment-actions reception-actions">
                                                <Link
                                                    to={`/reception/booking?patient=${patient.uuid}`}
                                                    className="doctor-primary-button"
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <CalendarDays size={16} />
                                                    Đặt lịch khám
                                                </Link>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>

            {isFormOpen && (
                <div
                    className="doctor-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                >
                    <section
                        className="doctor-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reception-patient-title"
                    >
                        <div className="doctor-modal-heading">
                            <div>
                                <span className="doctor-page-eyebrow">
                                    <UserPlus size={15} /> HỒ SƠ MỚI
                                </span>
                                <h2 id="reception-patient-title">Tạo hồ sơ bệnh nhân</h2>
                            </div>
                            <button
                                type="button"
                                className="doctor-modal-close"
                                onClick={closeForm}
                                disabled={isSubmitting}
                                aria-label="Đóng"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="reception-form-grid">
                                <label className="reception-input reception-input-full">
                                    <span>
                                        Họ tên <b>*</b>
                                    </span>
                                    <input
                                        value={form.fullName}
                                        onChange={updateField('fullName')}
                                        maxLength={150}
                                        placeholder="Nguyễn Văn A"
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <label className="reception-input">
                                    <span>
                                        Số điện thoại <b>*</b>
                                    </span>
                                    <input
                                        value={form.phone}
                                        onChange={updateField('phone')}
                                        inputMode="tel"
                                        maxLength={12}
                                        placeholder="0901234567"
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <label className="reception-input">
                                    <span>
                                        Ngày sinh <b>*</b>
                                    </span>
                                    <input
                                        type="date"
                                        value={form.dateOfBirth}
                                        max={getTodayString()}
                                        onChange={updateField('dateOfBirth')}
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <label className="reception-input reception-input-full">
                                    <span>
                                        Email <b>*</b>
                                    </span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={updateField('email')}
                                        maxLength={150}
                                        placeholder="benhnhan@example.com"
                                        autoComplete="off"
                                        disabled={isSubmitting}
                                    />
                                    <small>Email dùng để đăng nhập, không được trùng với tài khoản khác.</small>
                                </label>
                                <label className="reception-input reception-input-full">
                                    <span>
                                        Mật khẩu tạm <b>*</b>
                                    </span>
                                    <input
                                        type="text"
                                        value={form.password}
                                        onChange={updateField('password')}
                                        maxLength={72}
                                        placeholder="Ít nhất 8 ký tự"
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                    />
                                    <small>Hãy báo mật khẩu này cho bệnh nhân.</small>
                                </label>
                            </div>

                            {formError && (
                                <p className="doctor-feedback doctor-feedback-error" role="alert">
                                    <AlertCircle size={17} />
                                    {formError}
                                </p>
                            )}

                            <div className="doctor-modal-actions">
                                <button
                                    type="button"
                                    className="doctor-secondary-button"
                                    onClick={closeForm}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="doctor-primary-button" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Tạo hồ sơ'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default ReceptionPatientsPage;

import { useEffect, useState } from 'react';
import { ArrowRight, Search, Stethoscope, UserRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { getDepartments } from '../../services/departmentService';
import { searchDoctors } from '../../services/doctorService';

import './DoctorsPage.css';

function DoctorsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departmentError, setDepartmentError] = useState('');
    const [departmentRetryCount, setDepartmentRetryCount] = useState(0);

    const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');

    const [keyword, setKeyword] = useState(searchParams.get('fullName') || '');

    const [submittedKeyword, setSubmittedKeyword] = useState(searchParams.get('fullName') || '');

    const [doctorResult, setDoctorResult] = useState({
        key: null,
        doctors: [],
        error: '',
    });

    const [retryCount, setRetryCount] = useState(0);

    const selectedDepartment = departments.find((department) => String(department.id) === departmentId);

    const departmentName = selectedDepartment?.name || '';

    const requestKey = JSON.stringify([departmentName, submittedKeyword]);

    const doctors = doctorResult.doctors;

    const doctorsLoading = !departmentsLoading && !departmentError && doctorResult.key !== requestKey;

    const error = departmentError || doctorResult.error;

    useEffect(() => {
        let cancelled = false;

        getDepartments()
            .then((data) => {
                if (cancelled) return;

                setDepartments(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (cancelled) return;

                console.error('Lỗi tải danh sách khoa:', err);

                setDepartmentError('Không thể tải danh sách chuyên khoa. Vui lòng thử lại.');
            })
            .finally(() => {
                if (!cancelled) {
                    setDepartmentsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [departmentRetryCount]);

    useEffect(() => {
        if (departmentsLoading || departmentError) {
            return;
        }

        let cancelled = false;

        searchDoctors(departmentName, submittedKeyword)
            .then((data) => {
                if (cancelled) return;

                setDoctorResult({
                    key: requestKey,
                    doctors: Array.isArray(data) ? data : [],
                    error: '',
                });
            })
            .catch((err) => {
                if (cancelled) return;

                console.error('Lỗi tải danh sách bác sĩ:', err);

                setDoctorResult({
                    key: requestKey,
                    doctors: [],
                    error: 'Không thể tải danh sách bác sĩ. Vui lòng thử lại.',
                });
            });

        return () => {
            cancelled = true;
        };
    }, [departmentsLoading, departmentError, departmentName, submittedKeyword, requestKey, retryCount]);

    function updateSearchParams(nextDepartmentId, nextKeyword) {
        const nextParams = new URLSearchParams();

        if (nextDepartmentId) {
            nextParams.set('departmentId', nextDepartmentId);
        }

        if (nextKeyword) {
            nextParams.set('fullName', nextKeyword);
        }

        setSearchParams(nextParams);
    }

    function handleSearch(event) {
        event.preventDefault();

        const trimmedKeyword = keyword.trim();

        setSubmittedKeyword(trimmedKeyword);

        updateSearchParams(departmentId, trimmedKeyword);
    }

    function handleDepartmentChange(event) {
        const nextDepartmentId = event.target.value;

        setDepartmentId(nextDepartmentId);

        updateSearchParams(nextDepartmentId, submittedKeyword);
    }

    function handleRetryDepartments() {
        setDepartmentError('');
        setDepartmentsLoading(true);
        setDepartmentRetryCount((count) => count + 1);
    }

    function handleRetryDoctors() {
        setRetryCount((count) => count + 1);
    }

    return (
        <main className="doctors-page">
            <section className="container doctors-container">
                <div className="doctors-heading">
                    <span className="section-kicker">BỆNH VIỆN NAM LƯƠNG SƠN</span>

                    <h1>Đội ngũ bác sĩ</h1>

                    <p>Tìm kiếm bác sĩ theo chuyên khoa và lựa chọn người phù hợp với nhu cầu khám bệnh của bạn.</p>
                </div>

                <form className="doctors-filter" onSubmit={handleSearch}>
                    <label className="doctors-search-field">
                        <span>Tên bác sĩ</span>

                        <div className="doctors-input-wrap">
                            <Search size={19} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Nhập tên bác sĩ..."
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                            />
                        </div>
                    </label>

                    <label className="doctors-department-field">
                        <span>Chuyên khoa</span>

                        <select value={departmentId} onChange={handleDepartmentChange} disabled={departmentsLoading}>
                            <option value="">Tất cả chuyên khoa</option>

                            {departments.map((department) => (
                                <option key={department.id} value={String(department.id)}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        className="doctors-search-button"
                        type="submit"
                        disabled={departmentsLoading || doctorsLoading}
                    >
                        <Search size={17} aria-hidden="true" />
                        Tìm bác sĩ
                    </button>
                </form>

                {/* Tiêu đề kết quả */}
                <div className="doctors-results-heading">
                    <h2>Danh sách bác sĩ</h2>

                    {!departmentsLoading && !doctorsLoading && !error && <span>{doctors.length} bác sĩ</span>}
                </div>

                {departmentsLoading && (
                    <p className="doctors-message" role="status">
                        Đang tải danh sách chuyên khoa...
                    </p>
                )}

                {!departmentsLoading && departmentError && (
                    <div className="doctors-message doctors-error" role="alert">
                        <p>{departmentError}</p>

                        <button type="button" onClick={handleRetryDepartments}>
                            Thử tải lại
                        </button>
                    </div>
                )}

                {!departmentsLoading && !departmentError && doctorsLoading && (
                    <p className="doctors-message" role="status">
                        Đang tải danh sách bác sĩ...
                    </p>
                )}

                {!departmentsLoading && !departmentError && !doctorsLoading && doctorResult.error && (
                    <div className="doctors-message doctors-error" role="alert">
                        <p>{doctorResult.error}</p>

                        <button type="button" onClick={handleRetryDoctors}>
                            Thử tìm lại
                        </button>
                    </div>
                )}

                {!departmentsLoading && !doctorsLoading && !error && doctors.length === 0 && (
                    <div className="doctors-empty">
                        <Stethoscope size={30} aria-hidden="true" />

                        <h3>Chưa tìm thấy bác sĩ phù hợp</h3>

                        <p>Hãy thử thay đổi tên bác sĩ hoặc chọn chuyên khoa khác.</p>
                    </div>
                )}

                {!departmentsLoading && !doctorsLoading && !error && doctors.length > 0 && (
                    <div className="doctors-grid">
                        {doctors.map((doctor) => (
                            <article className="doctor-card" key={doctor.uuid}>
                                <div className="doctor-card-top">
                                    <div className="doctor-avatar" aria-hidden="true">
                                        <UserRound size={31} />
                                    </div>

                                    <span className="doctor-department">
                                        {doctor.departmentName || 'Chưa cập nhật chuyên khoa'}
                                    </span>
                                </div>

                                <h3>{doctor.fullName || 'Chưa cập nhật tên bác sĩ'}</h3>

                                <p className="doctor-experience">
                                    Kinh nghiệm:{' '}
                                    <strong>
                                        {doctor.yearsExperience ?? 'Đang cập nhật'}

                                        {doctor.yearsExperience != null ? ' năm' : ''}
                                    </strong>
                                </p>

                                <p className="doctor-bio">{doctor.bio || 'Thông tin giới thiệu đang được cập nhật.'}</p>

                                <Link to={`/doctors/${doctor.uuid}`} className="doctor-booking-link">
                                    Đặt lịch khám
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DoctorsPage;

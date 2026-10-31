import { ArrowRight, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import LocalImage from './LocalImage';

import './DoctorCard.css';

function DoctorCard({ doctor, to, showBio = false }) {
    const experience =
        doctor.yearsExperience != null ? `${doctor.yearsExperience} năm kinh nghiệm` : 'Đang cập nhật kinh nghiệm';

    return (
        <article className="doctor-card">
            <div className="doctor-card-avatar">
                <LocalImage
                    folder="doctors"
                    name={doctor.fullName}
                    alt={doctor.fullName || ''}
                    fallback={<UserRound size={46} strokeWidth={1.5} />}
                />
            </div>

            <span className="doctor-card-department">{doctor.departmentName || 'Bác sĩ'}</span>

            <h3 className="doctor-card-name">{doctor.fullName || 'Chưa cập nhật tên bác sĩ'}</h3>

            <p className="doctor-card-experience">{experience}</p>

            {showBio && <p className="doctor-card-bio">{doctor.bio || 'Thông tin giới thiệu đang được cập nhật.'}</p>}

            <Link to={to} className="doctor-card-link">
                Đặt lịch khám
                <ArrowRight size={17} />
            </Link>
        </article>
    );
}

export default DoctorCard;

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getSpecialtyIconElement } from '../../utils/specialtyIcon';
import LocalImage from './LocalImage';

import './DepartmentCard.css';

function DepartmentCard({ department }) {
    return (
        <article className="department-card">
            <div className="department-card-media">
                <LocalImage
                    folder="departments"
                    name={department.name}
                    alt=""
                    fallback={getSpecialtyIconElement(department.name, { size: 52, strokeWidth: 1.3 })}
                />

                <span className="department-card-icon">{getSpecialtyIconElement(department.name, { size: 22 })}</span>
            </div>

            <div className="department-card-body">
                <h3>{department.name}</h3>

                <p>{department.description || 'Thông tin khám và tư vấn chuyên khoa.'}</p>

                <Link to={`/doctors?departmentId=${department.id}`} className="department-card-link">
                    Tìm bác sĩ
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
}

export default DepartmentCard;

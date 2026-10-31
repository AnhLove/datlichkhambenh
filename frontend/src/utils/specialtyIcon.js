import React from 'react';
import { Activity, Baby, Bone, Brain, Ear, Eye, HeartPulse, Scan, Stethoscope } from 'lucide-react';

export function getSpecialtyIconElement(name = '', props = {}) {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('xương khớp')) return React.createElement(Bone, props);
    if (normalizedName.includes('mắt')) return React.createElement(Eye, props);
    if (normalizedName.includes('tim mạch')) return React.createElement(HeartPulse, props);
    if (normalizedName.includes('thần kinh')) return React.createElement(Brain, props);
    if (normalizedName.includes('sản')) return React.createElement(Baby, props);
    if (normalizedName.includes('tai mũi họng')) return React.createElement(Ear, props);
    if (normalizedName.includes('răng hàm mặt')) return React.createElement(Scan, props);
    if (normalizedName.includes('hô hấp')) return React.createElement(Activity, props);

    return React.createElement(Stethoscope, props);
}

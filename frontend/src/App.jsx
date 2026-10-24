import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RequireRole from './components/RequireRole';

import PublicLayout from './layouts/PublicLayout';
import DoctorLayout from './layouts/DoctorLayout';

import HomePage from './pages/HomePage';
import DepartmentsPage from './pages/DepartmentsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalServicesPage from './pages/MedicalServicesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyExamReportsPage from './pages/MyExamReportsPage';
import MyPaymentsPage from './pages/MyPaymentsPage';
import ProfilePage from './pages/ProfilePage';

import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import DoctorExamReportsPage from './pages/DoctorExamReportsPage';

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Trang công khai */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/medical-services" element={<MedicalServicesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Khu vực bệnh nhân: role = 1 */}
                <Route element={<RequireRole allowedRoles={[1]} />}>
                    <Route element={<PublicLayout />}>
                        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                        <Route path="/my-exam-reports" element={<MyExamReportsPage />} />
                        <Route path="/my-payments" element={<MyPaymentsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Khu vực bác sĩ: role = 2 */}
                <Route element={<RequireRole allowedRoles={[2]} />}>
                    <Route element={<DoctorLayout />}>
                        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
                        <Route path="/doctor/exam-reports" element={<DoctorExamReportsPage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

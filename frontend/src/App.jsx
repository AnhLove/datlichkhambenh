import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RequireRole from './components/RequireRole';
import RedirectStaffToPortal from './components/RedirectStaffToPortal';

import PublicLayout from './layouts/PublicLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ReceptionLayout from './layouts/ReceptionLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/HomePage';
import DepartmentsPage from './pages/DepartmentsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
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
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import DoctorExamReportsPage from './pages/DoctorExamReportsPage';

import ReceptionAppointmentsPage from './pages/ReceptionAppointmentsPage';
import ReceptionPatientsPage from './pages/ReceptionPatientsPage';
import ReceptionBookingPage from './pages/ReceptionBookingPage';
import ReceptionBillingPage from './pages/ReceptionBillingPage';
import ReceptionBillingDetailPage from './pages/ReceptionBillingDetailPage';

import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSystemConfigPage from './pages/AdminSystemConfigPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminExamReportsPage from './pages/AdminExamReportsPage';
import AdminWorkingHoursPage from './pages/AdminWorkingHoursPage.jsx';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminMedicalServicesPage from './pages/AdminMedicalServicesPage';

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RedirectStaffToPortal />}>
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/departments" element={<DepartmentsPage />} />
                        <Route path="/doctors" element={<DoctorsPage />} />
                        <Route path="/doctors/:uuid" element={<DoctorDetailPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/medical-services" element={<MedicalServicesPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                </Route>
                <Route element={<RequireRole allowedRoles={[1]} />}>
                    <Route element={<PublicLayout />}>
                        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                        <Route path="/my-exam-reports" element={<MyExamReportsPage />} />
                        <Route path="/my-payments" element={<MyPaymentsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>
                <Route element={<RequireRole allowedRoles={[2]} />}>
                    <Route element={<DoctorLayout />}>
                        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
                        <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
                        <Route path="/doctor/exam-reports" element={<DoctorExamReportsPage />} />
                        <Route path="/doctor/profile" element={<ProfilePage />} />
                    </Route>
                </Route>
                <Route element={<RequireRole allowedRoles={[3]} />}>
                    <Route element={<ReceptionLayout />}>
                        <Route path="/reception/appointments" element={<ReceptionAppointmentsPage />} />
                        <Route path="/reception/patients" element={<ReceptionPatientsPage />} />
                        <Route path="/reception/booking" element={<ReceptionBookingPage />} />
                        <Route path="/reception/billing" element={<ReceptionBillingPage />} />
                        <Route path="/reception/billing/:appointmentId" element={<ReceptionBillingDetailPage />} />
                        <Route path="/reception/profile" element={<ProfilePage />} />
                    </Route>
                </Route>
                <Route element={<RequireRole allowedRoles={[4]} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/configs" element={<AdminSystemConfigPage />} />
                        <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
                        <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                        <Route path="/admin/medical-services" element={<AdminMedicalServicesPage />} />
                        <Route path="/admin/working-hours" element={<AdminWorkingHoursPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/exam-reports" element={<AdminExamReportsPage />} />
                        <Route path="/admin/profile" element={<ProfilePage />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

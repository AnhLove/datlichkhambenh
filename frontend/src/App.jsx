import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DepartmentsPage from './pages/DepartmentsPage';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MedicalServicesPage from './pages/MedicalServicesPage';
import MyExamReportsPage from './pages/MyExamReportsPage';
import ProfilePage from './pages/ProfilePage';
import MyPaymentsPage from './pages/MyPaymentsPage';

import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                    <Route path="/my-exam-reports" element={<MyExamReportsPage />} />
                    <Route path="/my-payments" element={<MyPaymentsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/medical-services" element={<MedicalServicesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

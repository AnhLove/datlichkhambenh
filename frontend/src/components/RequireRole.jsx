import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import { unwrapData } from '../utils/unwrap';

function RequireRole({ allowedRoles }) {
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function checkUser() {
            try {
                const response = await apiGet('/me');

                if (!cancelled) {
                    setUser(unwrapData(response));
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        checkUser();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="role-loading" role="status">
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const role = Number(user.role);

    if (!allowedRoles.includes(role)) {
        if (role === 2) {
            return <Navigate to="/doctor/dashboard" replace />;
        }
        if (role === 3) {
            return <Navigate to="/reception/appointments" replace />;
        }
        if (role === 4) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RequireRole;

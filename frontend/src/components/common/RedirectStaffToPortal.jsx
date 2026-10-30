import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { apiGet } from '../../services/api';
import { unwrapData } from '../../utils/unwrap';
import { getRoleHome } from '../../utils/roleHome';

function RedirectStaffToPortal() {
    const { pathname } = useLocation();
    const [homePath, setHomePath] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function checkUser() {
            try {
                const user = unwrapData(await apiGet('/me'));
                if (cancelled) return;
                setHomePath(getRoleHome(Number(user?.role)));
            } catch {
                if (!cancelled) setHomePath(null);
            }
        }

        checkUser();

        return () => {
            cancelled = true;
        };
    }, [pathname]);

    if (homePath) {
        return <Navigate to={homePath} replace />;
    }

    return <Outlet />;
}

export default RedirectStaffToPortal;

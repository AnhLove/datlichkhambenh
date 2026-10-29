export function getRoleHome(role) {
    if (role === 2) return '/doctor/dashboard';
    if (role === 3) return '/reception/appointments';
    if (role === 4) return '/admin/dashboard';
    return null;
}

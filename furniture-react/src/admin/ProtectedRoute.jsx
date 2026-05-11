import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// List of authorized admin email addresses.
export const ADMIN_EMAILS = [
    'admin@theurbankarigar.com',
    'admin@gmail.com', // Added based on your current session
];

/**
 * Checks if the current user has administrative privileges.
 */
export const checkIsAdmin = (user, isAuthenticated) => {
    if (!isAuthenticated || !user) return false;
    
    // 1. Check for staff/superuser flags from backend
    if (user.is_staff || user.is_superuser) return true;
    
    // 2. Check against email whitelist
    if (ADMIN_EMAILS.includes(user.email)) return true;
    
    return false;
};

export default function ProtectedRoute({ children }) {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = checkIsAdmin(user, isAuthenticated);

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

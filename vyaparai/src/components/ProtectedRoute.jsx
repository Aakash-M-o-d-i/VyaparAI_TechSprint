/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="page center-content">
                <div className="loader">
                    <div className="loader__spinner"></div>
                    <span className="loader__text">Loading...</span>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
    }

    return children;
}

export default ProtectedRoute;

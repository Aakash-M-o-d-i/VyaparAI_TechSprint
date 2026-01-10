/**
 * Profile Protected Route
 * Ensures user is authenticated AND has completed their business profile setup
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

function ProfileProtectedRoute({ children }) {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        // Redirection to login if not authenticated
        return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
    }

    if (!userProfile?.profileCompleted) {
        // Redirection to setup if profile not completed
        return <Navigate to="/setup" replace />;
    }

    return children;
}

export default ProfileProtectedRoute;

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuth } from '@/redux/auth/selectors';
import { Result, Button } from 'antd';

/**
 * ProtectedRoute — wraps any page/module that requires:
 *   1. An authenticated user session
 *   2. One of the specified roles
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['CEO', 'Manager']}>
 *     <SalesModule />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isLoggedIn, current } = useSelector(selectAuth);

    // Not logged in → redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Role check (if allowedRoles is empty, any logged-in user can access)
    if (allowedRoles.length > 0 && current?.role && !allowedRoles.includes(current.role)) {
        return (
            <Result
                status="403"
                title="Access Denied"
                subTitle="You do not have permission to view this page."
                extra={
                    <Button type="primary" href="/dashboard" style={{ background: '#0a1628', borderColor: '#c9a84c' }}>
                        Back to Dashboard
                    </Button>
                }
            />
        );
    }

    return children;
}

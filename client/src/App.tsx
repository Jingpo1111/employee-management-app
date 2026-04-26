import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminAnalyticsPage, AdminAttendancePage, AdminEmployeeDetailPage, AdminEmployeesPage, AdminOverviewPage } from './pages/admin/AdminPages';
import { AdminQrAccessPage } from './pages/admin/AdminQrPage';
import { EmployeeOverviewPage, EmployeeProfilePage, EmployeeWorkspacePage } from './pages/employee/EmployeePages';
import { NotificationsPage } from './pages/NotificationsPage';
import { ScanPage } from './pages/ScanPage';
import { LoadingState } from './components/ui/LoadingState';

function ProtectedRoute({ role }: { role?: 'ADMIN' | 'EMPLOYEE' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Restoring session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/overview' : '/employee/overview'} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin/overview' : '/employee/overview'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/scan/:token" element={<ScanPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />
      </Route>
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route element={<AppShell />}>
          <Route path="/admin/overview" element={<AdminOverviewPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/attendance" element={<AdminAttendancePage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/employees/:id" element={<AdminEmployeeDetailPage />} />
          <Route path="/admin/qr-access" element={<AdminQrAccessPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="EMPLOYEE" />}>
        <Route element={<AppShell />}>
          <Route path="/employee/overview" element={<EmployeeOverviewPage />} />
          <Route path="/employee/notifications" element={<NotificationsPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
          <Route path="/employee/workspace" element={<EmployeeWorkspacePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

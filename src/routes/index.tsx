import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicPage from '@/pages/public/PublicPage';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/AuthLayout';

const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));
const ProfilePage = lazy(() => import('@/pages/admin/ProfilePage'));
const ContactMethodsPage = lazy(() => import('@/pages/admin/ContactMethodsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));

// A simple loading fallback for lazy-loaded admin routes
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AdminLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/contact" replace />} />
          <Route path="/contact/:id?" element={<PublicPage />} />
          
          {/* Admin Login (Only accessible if NOT logged in) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/admin/login" element={<LoginPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="methods" element={<ContactMethodsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/contact" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

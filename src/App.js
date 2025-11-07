import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MapViewPage from './pages/MapViewPage';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import CookieConsent from './components/CookieConsent';
import { initGA, trackPageView } from './utils/analytics';

// Component to track page views
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on mount
    if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
      initGA(process.env.REACT_APP_GA_MEASUREMENT_ID);
    }

    // Track page view on route change
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <PageTracker />
        <AuthProvider>
          <NotificationProvider>
            <CookieConsent />
            <Routes>
            <Route
              path="/"
              element={<MapViewPage />}
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <MapViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <MapViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <MapViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MapViewPage>
                    <Profile />
                  </MapViewPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MapViewPage>
                    <Settings />
                  </MapViewPage>
                </ProtectedRoute>
              }
            />
            <Route path="/auth/login" element={<Layout><Login /></Layout>} />
            <Route path="/auth/signup" element={<Layout><SignUp /></Layout>} />
            <Route path="/auth/verify-email" element={<Layout><VerifyEmail /></Layout>} />
            <Route path="/auth/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <MapViewPage>
                    <AdminDashboard />
                  </MapViewPage>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

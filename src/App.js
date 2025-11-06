import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './config/theme';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
            <Route
              path="/"
              element={<MapViewPage />}
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

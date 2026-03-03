import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { Login } from './pages/Login';
import { FinancialSheet } from './pages/FinancialSheet';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas privadas */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<FinancialSheet />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <Users />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#fff', fontSize: '14px' },
        }}
      />
    </AuthProvider>
  );
}

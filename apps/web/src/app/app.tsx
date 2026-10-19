import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { useTokenGuard } from './hooks/useTokenGuard';
import { LocaleProvider } from './hooks/useLocale';
import AdminRoute from './components/AdminRoute';
import TicketForm from './pages/TicketForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCompleteProfile from './pages/AdminCompleteProfile';
import AdminQrGenerator from './pages/AdminQrGenerator';

const qc = new QueryClient();

function UserGate() {
  const state = useTokenGuard();
  if (state !== 'valid') return null;
  return <TicketForm />;
}

function AppRoutes() {
  useAuth();
  return (
    <Routes>
      <Route path="/" element={<UserGate />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/complete-profile"
        element={<AdminCompleteProfile />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/admin/qr-generator" element={<AdminRoute><AdminQrGenerator /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <LocaleProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

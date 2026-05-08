import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Identify from './pages/Identify';
import Diagnose from './pages/Diagnose';
import History from './pages/History';
import Profile from './pages/Profile';
import PlantDetail from './pages/PlantDetail';
import DiagnosisReport from './pages/DiagnosisReport';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Guest */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/identify" element={<ProtectedRoute><Identify /></ProtectedRoute>} />
      <Route path="/diagnose" element={<ProtectedRoute><Diagnose /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/plant/:id" element={<ProtectedRoute><PlantDetail /></ProtectedRoute>} />
      <Route path="/diagnosis/:id" element={<ProtectedRoute><DiagnosisReport /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2e1a',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px'
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

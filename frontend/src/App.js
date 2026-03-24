import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import StoreBuilder from "./pages/StoreBuilder";
import PublicStore from "./pages/PublicStore";
import BrandDashboard from "./pages/BrandDashboard";
import AIToolsHub from "./pages/AIToolsHub";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-creatorflow-bg flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={
        isAuthenticated ? (
          <Navigate to={user?.role === 'brand' ? '/brand/dashboard' : '/dashboard'} replace />
        ) : (
          <AuthPage />
        )
      } />
      <Route path="/store/:username" element={<PublicStore />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      
      {/* Creator Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <CreatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/store-builder" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <StoreBuilder />
        </ProtectedRoute>
      } />
      <Route path="/ai-tools" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <AIToolsHub />
        </ProtectedRoute>
      } />
      
      {/* Brand Routes */}
      <Route path="/brand/dashboard" element={
        <ProtectedRoute allowedRoles={['brand']}>
          <BrandDashboard />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App min-h-screen bg-creatorflow-bg">
          <div className="noise-overlay" />
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

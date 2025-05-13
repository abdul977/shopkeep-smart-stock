import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toast';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import ForgotPassword from '@/pages/ForgotPassword';
import ManageShopkeepers from '@/pages/ManageShopkeepers';
import Shopkeeper from '@/pages/Shopkeeper';
import ShopkeeperDashboard from '@/pages/ShopkeeperDashboard';
import ShopkeeperLogin from '@/pages/ShopkeeperLogin';
import ShopkeeperPOS from '@/pages/ShopkeeperPOS';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ShopkeeperProtectedRoute from '@/components/auth/ShopkeeperProtectedRoute';
import './App.css';

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shopkeeper/login/:shareId?" element={<ShopkeeperLogin />} />
          <Route path="/shop/:shareId" element={<Shopkeeper />} />

          {/* Protected routes for owners */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/manage-shopkeepers" element={
            <ProtectedRoute>
              <ManageShopkeepers />
            </ProtectedRoute>
          } />

          {/* Protected routes for shopkeepers */}
          <Route path="/shopkeeper/dashboard" element={
            <ShopkeeperProtectedRoute>
              <ShopkeeperDashboard />
            </ShopkeeperProtectedRoute>
          } />
          <Route path="/shopkeeper/pos" element={
            <ShopkeeperProtectedRoute>
              <ShopkeeperPOS />
            </ShopkeeperProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;

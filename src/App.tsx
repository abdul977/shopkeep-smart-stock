import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { ShopkeeperProvider } from "./contexts/ShopkeeperContext";
import BlueThemeProvider from "./components/ui/BlueThemeProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ShopkeeperProtectedRoute from "./components/auth/ShopkeeperProtectedRoute";
import Index from "./pages/Index";
import Shopkeeper from "./pages/Shopkeeper";
import ManageShopkeepers from "./pages/ManageShopkeepers";
import ShopkeeperLogin from "./pages/ShopkeeperLogin";
import ShopkeeperDashboard from "./pages/ShopkeeperDashboard";
import ShopkeeperPOS from "./pages/ShopkeeperPOS";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { WelcomeDialog } from "./components/welcome/WelcomeDialog";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Check if user has visited before
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      // Only show after a slight delay to ensure page has loaded properly
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <ShopkeeperProvider>
            <BlueThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <WelcomeDialog open={showWelcome} onOpenChange={setShowWelcome} />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-shopkeepers"
                      element={
                        <ProtectedRoute>
                          <ManageShopkeepers />
                        </ProtectedRoute>
                      }
                    />

                    {/* Shop routes - Order matters! More specific routes first */}
                    {/* Special route for direct user ID access */}
                    <Route
                      path="/shop/5c0d304b-5b84-48a4-a9af-dd0d182cde87"
                      element={<Shopkeeper />}
                    />
                    <Route path="/shop/:shareId" element={<Shopkeeper />} />
                    <Route path="/shop" element={<Shopkeeper />} />

                    {/* Shopkeeper routes */}
                    <Route path="/shopkeeper-login/:storeId?" element={<ShopkeeperLogin />} />
                    <Route
                      path="/shopkeeper-dashboard"
                      element={
                        <ShopkeeperProtectedRoute>
                          <ShopkeeperDashboard />
                        </ShopkeeperProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper-pos"
                      element={
                        <ShopkeeperProtectedRoute>
                          <ShopkeeperPOS />
                        </ShopkeeperProtectedRoute>
                      }
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </BlueThemeProvider>
          </ShopkeeperProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

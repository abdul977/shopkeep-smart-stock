import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ShopkeeperProtectedRouteProps {
  children: ReactNode;
}

const ShopkeeperProtectedRoute = ({ children }: ShopkeeperProtectedRouteProps) => {
  const { shopkeeperUser, isShopkeeper, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg text-blue-300">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated as a shopkeeper
  if (!isShopkeeper || !shopkeeperUser) {
    return <Navigate to="/shopkeeper-login" replace />;
  }

  // If authenticated as a shopkeeper, render the protected content
  return <>{children}</>;
};

export default ShopkeeperProtectedRoute;

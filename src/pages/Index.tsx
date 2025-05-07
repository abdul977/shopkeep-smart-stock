
import { useState, useEffect } from "react";
import { InventoryProvider, useInventory } from "@/contexts/InventoryContext";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import Products from "@/components/products/Products";
import Inventory from "@/components/inventory/Inventory";
import Categories from "@/components/categories/Categories";
import Reports from "@/components/reports/Reports";
import Settings from "@/components/settings/Settings";
import { Menu } from "lucide-react";

const MainContent = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { loading } = useInventory();

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-inventory-primary"></div>
          <p className="ml-3 text-lg text-gray-600">Loading inventory data...</p>
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "inventory":
        return <Inventory />;
      case "categories":
        return <Categories />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <div className="sticky top-0 bg-white shadow-sm z-30 p-4 flex items-center justify-between md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-blue-600">SmartStock</h1>

          <div className="w-10"></div> {/* Empty div for balanced spacing */}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Responsive */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto w-full">
          {/* Page Content */}
          <div className="p-4 md:p-6">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <InventoryProvider>
      <MainContent />
    </InventoryProvider>
  );
};

export default Index;

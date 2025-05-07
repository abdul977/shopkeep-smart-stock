
import { useState } from "react";
import { InventoryProvider, useInventory } from "@/contexts/InventoryContext";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import Products from "@/components/products/Products";
import Inventory from "@/components/inventory/Inventory";
import Categories from "@/components/categories/Categories";
import Reports from "@/components/reports/Reports";
import Settings from "@/components/settings/Settings";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageBackground, GlowCircle } from "@/components/ui/global-styles";

const MainContent = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { loading } = useInventory();

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-lg text-blue-300">Loading inventory data...</p>
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
    <PageBackground darkMode className="min-h-screen flex flex-col">
      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <div className="sticky top-0 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] shadow-md z-30 p-4 flex items-center justify-between md:hidden border-b border-blue-900/30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-blue-800/20 text-blue-300"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">SmartStock</h1>

          <div className="w-10"></div> {/* Empty div for balanced spacing */}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Background effects */}
        <GlowCircle className="w-[400px] h-[400px] bg-blue-800/20 top-0 right-0 hidden md:block" />
        <GlowCircle className="w-[300px] h-[300px] bg-blue-800/20 bottom-20 left-10 hidden md:block" />

        {/* Sidebar - Responsive */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto w-full relative z-10">
          {/* Page Content */}
          <div className="p-4 md:p-6">
            {renderPage()}
          </div>
        </div>
      </div>
    </PageBackground>
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

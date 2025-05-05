
import { useState } from "react";
import { InventoryProvider } from "@/contexts/InventoryContext";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import Products from "@/components/products/Products";
import Inventory from "@/components/inventory/Inventory";
import Categories from "@/components/categories/Categories";
import Reports from "@/components/reports/Reports";
import Settings from "@/components/settings/Settings";

const Index = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
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
    <InventoryProvider>
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </InventoryProvider>
  );
};

export default Index;

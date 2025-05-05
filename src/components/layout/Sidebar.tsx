
import { useState } from "react";
import {
  Box,
  Package,
  BarChart,
  Settings,
  Menu,
  X,
  Tag,
  Home,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar = ({ activePage, setActivePage }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Box },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col shadow-sm`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="text-xl font-bold text-inventory-primary">SmartStock</div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="flex-grow py-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center p-3 mb-1 ${
              collapsed ? "justify-center" : "px-6"
            } ${
              activePage === item.id
                ? "bg-blue-50 text-inventory-primary border-r-4 border-inventory-primary"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

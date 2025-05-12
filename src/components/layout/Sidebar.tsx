
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
  LogOut,
  ShoppingCart,
  Share2,
  Users,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import ShareShopDialog from "./ShareShopDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlowCircle } from "@/components/landing/LandingSvgs";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

const Sidebar = ({
  activePage,
  setActivePage,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { signOut } = useAuth();
  const { storeSettings } = useStore();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Box },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "sales", label: "Sales", icon: DollarSign },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const shopActions = [
    { id: "open-shop", label: "Open Shop", icon: ShoppingCart, onClick: () => openShopInNewTab(), color: "text-green-300" },
    { id: "share-shop", label: "Share Shop", icon: Share2, onClick: () => setShareDialogOpen(true), color: "text-blue-300" },
    { id: "manage-shopkeepers", label: "Manage Shopkeepers", icon: Users, onClick: () => navigate("/manage-shopkeepers"), color: "text-blue-300" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const openShopInNewTab = () => {
    const shareId = storeSettings?.shareId || 'demo';
    const shopUrl = `${window.location.origin}/shop/${shareId}`;
    window.open(shopUrl, '_blank');
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  // Handle navigation item click on mobile
  const handleNavItemClick = (pageId: string) => {
    setActivePage(pageId);
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Render mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Sidebar - Slide in from left with overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleMobileMenuToggle}
          aria-hidden="true"
        />

        <div
          className={`fixed top-0 left-0 h-screen w-[85%] max-w-[280px] bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border-r border-blue-900/30 z-50 transform transition-all duration-300 ease-in-out shadow-xl ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col relative overflow-hidden`}
          style={{ position: 'fixed', left: 0, top: 0 }}
        >
          {/* Background effects */}
          <GlowCircle className="w-[200px] h-[200px] bg-blue-800/30 -top-20 -right-20" />
          <GlowCircle className="w-[200px] h-[200px] bg-blue-800/30 bottom-20 -left-20" />

          <div className="flex items-center justify-between p-4 border-b border-blue-900/30 relative z-10">
            <div className="flex items-center gap-2">
              {storeSettings?.logoUrl && (
                <div className="h-8 w-8 bg-blue-900/40 rounded-full flex items-center justify-center overflow-hidden border border-blue-700/30">
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.storeName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                    }}
                  />
                </div>
              )}
              <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">SmartStock</div>
            </div>
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-md hover:bg-blue-800/20 text-blue-300"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow py-2 overflow-y-auto relative z-10">
            {/* Navigation Items */}
            <div className="px-3 mb-4">
              <h3 className="text-xs uppercase text-blue-300/70 font-semibold px-3 mb-2 mt-2">Navigation</h3>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`w-full flex items-center p-3 mb-1 rounded-md transition-colors ${
                    activePage === item.id
                      ? "bg-blue-900/40 text-blue-200 font-medium"
                      : "text-blue-100 hover:bg-blue-800/20"
                  }`}
                >
                  <item.icon size={20} className={activePage === item.id ? "text-blue-300" : "text-blue-400/70"} />
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Shop Actions */}
            <div className="px-3 py-2 border-t border-blue-900/30 mt-2">
              <h3 className="text-xs uppercase text-blue-300/70 font-semibold px-3 mb-2 mt-2">Shop Actions</h3>
              {shopActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`w-full flex items-center p-3 ${action.color} hover:bg-blue-800/30 rounded-md mb-1`}
                >
                  <action.icon size={20} />
                  <span className="ml-3">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-blue-900/30 relative z-10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 text-red-300 hover:bg-blue-800/30 rounded-md"
            >
              <LogOut size={20} />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>

          {/* Share Dialog */}
          <ShareShopDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
        </div>
      </>
    );
  }

  // Render desktop sidebar
  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border-r border-blue-900/30 h-screen transition-all duration-300 flex flex-col shadow-sm hidden md:flex relative overflow-hidden`}
    >
      {/* Background effects */}
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/30 -top-20 -right-20" />
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/30 bottom-20 -left-20" />

      <div className="flex items-center justify-between p-4 border-b border-blue-900/30 relative z-10">
        {!collapsed && (
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">SmartStock</div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-blue-800/20 text-blue-300"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="flex-grow py-2 overflow-y-auto relative z-10">
        {/* Navigation Items */}
        <div className={collapsed ? "px-1" : "px-3"}>
          {!collapsed && (
            <h3 className="text-xs uppercase text-blue-300/70 font-semibold px-3 mb-2 mt-2">Navigation</h3>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center p-3 mb-1 ${
                collapsed ? "justify-center" : ""
              } ${
                activePage === item.id
                  ? "bg-blue-900/40 text-blue-200 font-medium rounded-md"
                  : "text-blue-100 hover:bg-blue-800/20 rounded-md"
              }`}
            >
              <item.icon
                size={20}
                className={activePage === item.id ? "text-blue-300" : "text-blue-400/70"}
              />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-blue-900/30 relative z-10">
        {/* Shop Actions */}
        <div className={collapsed ? "px-0" : "px-0 mb-4"}>
          {!collapsed && (
            <h3 className="text-xs uppercase text-blue-300/70 font-semibold px-3 mb-2">Shop Actions</h3>
          )}
          <div className="flex flex-col space-y-2">
            {shopActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`w-full flex items-center p-3 ${action.color} hover:bg-blue-800/30 rounded-md ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <action.icon size={20} />
                {!collapsed && <span className="ml-3">{action.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className={collapsed ? "mt-4" : "mt-2 pt-2 border-t border-blue-900/30"}>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center p-3 text-red-300 hover:bg-blue-800/30 rounded-md ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>

        <ShareShopDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      </div>
    </div>
  );
};

export default Sidebar;

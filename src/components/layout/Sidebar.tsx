
import { useState, useEffect } from "react";
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
  Copy,
  ExternalLink,
  QrCode,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import ShareShopDialog from "./ShareShopDialog";

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
  const [isMobile, setIsMobile] = useState(false);
  const { signOut } = useAuth();
  const { storeSettings } = useStore();
  const navigate = useNavigate();

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

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Box },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const copyShopLink = () => {
    const shareId = storeSettings?.shareId || 'demo';
    const shopUrl = `${window.location.origin}/shop/${shareId}`;
    navigator.clipboard.writeText(shopUrl)
      .then(() => {
        toast.success("Shop link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
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
          className={`fixed top-0 left-0 h-screen w-[85%] max-w-[300px] bg-white border-r border-gray-200 z-50 transform transition-all duration-300 ease-in-out shadow-xl ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {storeSettings?.logoUrl && (
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
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
              <div className="text-xl font-bold text-inventory-primary">SmartStock</div>
            </div>
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow py-2 overflow-y-auto">
            {/* Navigation Items */}
            <div className="px-3 mb-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2 mt-2">Navigation</h3>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  className={`w-full flex items-center p-3 mb-1 rounded-md transition-colors ${
                    activePage === item.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon size={20} className={activePage === item.id ? "text-blue-600" : "text-gray-500"} />
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Shop Actions */}
            <div className="px-3 py-2 border-t border-gray-100 mt-2">
              <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2 mt-2">Shop Actions</h3>
              <button
                onClick={openShopInNewTab}
                className="w-full flex items-center p-3 text-green-600 hover:bg-green-50 rounded-md mb-1"
              >
                <ShoppingCart size={20} />
                <span className="ml-3">Open Shop</span>
              </button>

              <button
                onClick={() => setShareDialogOpen(true)}
                className="w-full flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Share2 size={20} />
                <span className="ml-3">Share Shop</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-md"
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
      } bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col shadow-sm hidden md:flex`}
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

      <div className="flex-grow py-2 overflow-y-auto">
        {/* Navigation Items */}
        <div className={collapsed ? "px-1" : "px-3"}>
          {!collapsed && (
            <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2 mt-2">Navigation</h3>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center p-3 mb-1 ${
                collapsed ? "justify-center" : ""
              } ${
                activePage === item.id
                  ? "bg-blue-50 text-blue-600 font-medium rounded-md"
                  : "text-gray-700 hover:bg-gray-100 rounded-md"
              }`}
            >
              <item.icon
                size={20}
                className={activePage === item.id ? "text-blue-600" : "text-gray-500"}
              />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        {/* Shop Actions */}
        <div className={collapsed ? "px-0" : "px-0 mb-4"}>
          {!collapsed && (
            <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">Shop Actions</h3>
          )}
          <div className="flex flex-col space-y-2">
            <button
              onClick={openShopInNewTab}
              className={`w-full flex items-center p-3 text-green-600 hover:bg-green-50 rounded-md ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <ShoppingCart size={20} />
              {!collapsed && <span className="ml-3">Open Shop</span>}
            </button>

            <button
              onClick={() => setShareDialogOpen(true)}
              className={`w-full flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-md ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Share2 size={20} />
              {!collapsed && <span className="ml-3">Share Shop</span>}
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className={collapsed ? "mt-4" : "mt-2 pt-2 border-t border-gray-100"}>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-md ${
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

import { ReactNode, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageBackground, GlowCircle } from "@/components/ui/global-styles";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <PageBackground className="min-h-screen">
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f0a1e] p-4 flex justify-between items-center border-b border-blue-900/30 relative z-20">
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              SmartStock
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-blue-800/20 text-blue-300"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Background effects */}
          <GlowCircle className="w-[400px] h-[400px] bg-blue-800/20 top-0 right-0 hidden md:block" />
          <GlowCircle className="w-[300px] h-[300px] bg-blue-800/20 bottom-20 left-10 hidden md:block" />

          {/* Sidebar - Only visible on desktop */}
          <div className="hidden md:block">
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          </div>

          {/* Mobile Sidebar - Separate from layout flow */}
          {isMobile && (
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default DashboardLayout;

import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Star, Search, BarChart3, LineChart, Zap, Sparkles, Rocket, ShoppingBag, Package, TrendingUp, LogOut } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useInventory, InventoryProvider } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { HeroScrollSection } from "@/components/landing/HeroScrollSection";
import {
  HeroBackground,
  FeatureIcon1,
  FeatureIcon2,
  FeatureIcon3,
  DashboardSvg,
  WaveDivider,
  GlowCircle,
  CheckIcon,
  SEODashboardSvg,
  FeatureCardSvg,
  RingGraphSvg,
  ClientLogoGrid,
  PricingCardSvg
} from "@/components/landing/LandingSvgs";

const LandingContent = () => {
  const { storeSettings } = useStore();
  const { products, categories, getLowStockProducts, getTotalInventoryValue } = useInventory();
  const { user, signOut } = useAuth();
  const storeName = storeSettings?.storeName || "ShopKeep Smart Stock";

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a1e] text-white overflow-hidden">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white overflow-hidden">
        <HeroBackground />
        <GlowCircle className="w-[300px] h-[300px] bg-blue-600 top-0 right-0" />
        <GlowCircle className="w-[200px] h-[200px] bg-blue-800 bottom-20 left-10" />

        <div className="container relative mx-auto px-4 py-8 md:py-16">
          <nav className="flex justify-between items-center mb-16 z-10 relative">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              {storeName}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center text-blue-300 hover:text-blue-200 transition-colors px-3 py-1 border border-blue-500/30 rounded-md bg-blue-900/20 backdrop-blur-sm"
                  >
                    <BarChart3 size={16} className="mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-blue-300 hover:text-blue-200 transition-colors px-3 py-1 border border-blue-500/30 rounded-md bg-blue-900/20 backdrop-blur-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Integrated Scroll Animation Component */}
          <HeroScrollSection />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pb-16">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
              >
                Go to Dashboard <ArrowRight className="ml-2" size={18} />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
              >
                Get Started <ArrowRight className="ml-2" size={18} />
              </Link>
            )}
            <Link
              to="/shop/demo"
              className="bg-transparent text-white border border-blue-500 px-6 py-3 rounded-md font-medium flex items-center justify-center hover:bg-blue-900/30 transition-colors"
            >
              View Shop Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-[#0f0a1e] py-16">
        <div className="container mx-auto px-4">
          {!user && (
            <div className="text-center mb-6">
              <p className="text-blue-300/70 text-sm">
                <span className="bg-blue-900/50 px-2 py-1 rounded-md">Demo Data</span> - Sign up to track your own inventory
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-white mb-2">{products.length}</div>
              <p className="text-blue-300/70">Products</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-white mb-2">{categories.length}</div>
              <p className="text-blue-300/70">Categories</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-white mb-2">{lowStockProducts.length}</div>
              <p className="text-blue-300/70">Low Stock Items</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-white mb-2">₦{Math.round(totalValue).toLocaleString()}</div>
              <p className="text-blue-300/70">Inventory Value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-[#0f0a1e] py-12 border-t border-b border-blue-900/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-blue-300/60 mb-8">TRUSTED BY LEADING COMPANIES</p>
          <ClientLogoGrid />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#0f0a1e] relative">
        <GlowCircle className="w-[400px] h-[400px] bg-blue-900 top-40 -right-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Elevate your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">inventory efforts</span></h2>
            <p className="text-blue-300/70 max-w-2xl mx-auto">
              Our powerful tools help you manage your inventory with precision and ease
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group">
              <div className="bg-blue-800/50 text-blue-300 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inventory Management</h3>
              <p className="text-blue-300/70">
                Track stock levels, set reorder points, and manage product details all in one place.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group">
              <div className="bg-blue-800/50 text-blue-300 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sales Analytics</h3>
              <p className="text-blue-300/70">
                Get insights into your best-selling products and track performance over time with detailed reports.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group">
              <div className="bg-blue-800/50 text-blue-300 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Point of Sale</h3>
              <p className="text-blue-300/70">
                Create a public storefront for your inventory and process sales with our easy-to-use interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#0f0a1e] relative">
        <GlowCircle className="w-[300px] h-[300px] bg-blue-800 bottom-20 left-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our clients</h2>
            <p className="text-blue-300/70 max-w-2xl mx-auto">
              See what our customers are saying about {storeName}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Client" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Adebayo Stores</h3>
                  <p className="text-blue-300/70">Retail Business Owner</p>
                  <div className="flex text-yellow-400 mt-1">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
              </div>
              <p className="text-blue-200 italic">
                "{storeName} has completely transformed how we manage our inventory. The interface is intuitive and the analytics help us make better purchasing decisions. We've reduced stockouts by 75% and increased our overall sales by 30% since implementing this system."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-[#0f0a1e] relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
            <p className="text-blue-300/70 max-w-2xl mx-auto">
              Choose the plan that works best for your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-blue-300/70 mb-6">For small businesses</p>
              <div className="text-3xl font-bold mb-6">₦25,000<span className="text-sm font-normal text-blue-300/70">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Up to 500 products</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Public storefront</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Email support</span>
                </li>
              </ul>
              {user ? (
                <Link
                  to="/dashboard"
                  className="block w-full bg-blue-900/50 text-white py-2 rounded-md text-center hover:bg-blue-800 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block w-full bg-blue-900/50 text-white py-2 rounded-md text-center hover:bg-blue-800 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-700/40 to-blue-600/20 p-8 rounded-xl border border-blue-500/50 backdrop-blur-sm transform scale-105 shadow-lg shadow-blue-900/20 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-blue-300/70 mb-6">For growing businesses</p>
              <div className="text-3xl font-bold mb-6">₦45,000<span className="text-sm font-normal text-blue-300/70">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Unlimited products</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Multiple user accounts</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Custom branding</span>
                </li>
              </ul>
              {user ? (
                <Link
                  to="/dashboard"
                  className="block w-full bg-blue-600 text-white py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block w-full bg-blue-600 text-white py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-8 rounded-xl border border-blue-700/30 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-blue-300/70 mb-6">For large businesses</p>
              <div className="text-3xl font-bold mb-6">₦75,000<span className="text-sm font-normal text-blue-300/70">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Unlimited everything</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">24/7 dedicated support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">Advanced security</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon /> <span className="ml-2">API access</span>
                </li>
              </ul>
              {user ? (
                <Link
                  to="/dashboard"
                  className="block w-full bg-blue-900/50 text-white py-2 rounded-md text-center hover:bg-blue-800 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block w-full bg-blue-900/50 text-white py-2 rounded-md text-center hover:bg-blue-800 transition-colors"
                >
                  Contact Sales
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-[#0f0a1e] relative">
        <GlowCircle className="w-[400px] h-[400px] bg-blue-900 top-0 right-0" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">AI-driven inventory management for everyone</h2>
          <p className="text-xl text-blue-300/80 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that use {storeName} to manage their inventory and boost sales.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-md font-medium inline-flex items-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
            >
              Go to Dashboard <ChevronRight className="ml-2" size={18} />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-md font-medium inline-flex items-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
            >
              Get Started <ChevronRight className="ml-2" size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a071a] text-white py-12 border-t border-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              {storeName}
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <BarChart3 size={16} className="mr-2" /> Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                to="/shop/demo"
                className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
              >
                <ShoppingBag size={16} className="mr-2" /> Shop Demo
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-900/30 text-center text-blue-400/60 text-sm">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const Landing = () => {
  return (
    <InventoryProvider>
      <LandingContent />
    </InventoryProvider>
  );
};

export default Landing;

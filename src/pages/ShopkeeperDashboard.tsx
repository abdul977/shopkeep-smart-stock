import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { supabase } from "@/lib/supabase";
import { PageBackground, GlowCircle } from "@/components/ui/global-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, LogOut, BarChart, Settings, AlertCircle, History } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ProductGrid from "@/components/shopkeeper/ProductGrid";
import ShopkeeperHeader from "@/components/shopkeeper/ShopkeeperHeader";
import ShoppingCartComponent from "@/components/shopkeeper/ShoppingCart";
import ReceiptHistory from "@/components/shopkeeper/ReceiptHistory";
import { useOwnerData } from "@/hooks/useOwnerData";
import { toast } from "sonner";

const ShopkeeperDashboardContent = () => {
  const { shopkeeperUser, isShopkeeper, signOut } = useAuth();
  const { storeSettings, updateStoreSettings, loading: storeLoading } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptHistoryOpen, setIsReceiptHistoryOpen] = useState(false);
  const [loadingStoreSettings, setLoadingStoreSettings] = useState(false);

  // Use the custom hook to load the owner's data
  const {
    products,
    categories,
    loading,
    error
  } = useOwnerData(shopkeeperUser?.ownerId);

  // Show error toast if there's an error loading data
  useEffect(() => {
    if (error) {
      toast.error(`Error loading store data: ${error}`);
    }
  }, [error]);

  // Redirect if not logged in as shopkeeper
  useEffect(() => {
    if (!isShopkeeper || !shopkeeperUser) {
      navigate("/shopkeeper-login");
    }
  }, [isShopkeeper, shopkeeperUser, navigate]);

  // Set page title
  useEffect(() => {
    if (storeSettings) {
      document.title = `${storeSettings.storeName} - Shopkeeper Dashboard`;
    } else {
      document.title = "SmartStock - Shopkeeper Dashboard";
    }

    // Restore original title when component unmounts
    return () => {
      document.title = "SmartStock";
    };
  }, [storeSettings]);

  // Load store settings for the owner
  useEffect(() => {
    if (shopkeeperUser) {
      const loadStoreSettings = async () => {
        try {
          setLoadingStoreSettings(true);
          console.log("Loading store settings for owner:", shopkeeperUser.ownerId);

          // Fetch store settings for the owner
          const { data: storeData, error: storeError } = await supabase
            .from('store_settings')
            .select('*')
            .eq('user_id', shopkeeperUser.ownerId)
            .single();

          if (storeError) {
            console.error("Error fetching store settings:", storeError);
            toast.error("Failed to load store settings");
          } else {
            console.log("Loaded store settings:", storeData);

            // Update the store settings in the context
            if (storeData) {
              const formattedSettings = {
                id: storeData.id,
                storeName: storeData.store_name,
                location: storeData.location || undefined,
                phoneNumber: storeData.phone_number || undefined,
                logoUrl: storeData.logo_url || undefined,
                businessHours: storeData.business_hours || undefined,
                shareId: storeData.share_id || undefined,
                createdAt: new Date(storeData.created_at),
                updatedAt: new Date(storeData.updated_at)
              };

              // Use the updateStoreSettings function from the StoreContext
              // This will ensure the store settings are properly updated
              await updateStoreSettings(formattedSettings);
              toast.success("Store settings loaded successfully");
            }
          }
        } catch (error) {
          console.error("Error loading store settings:", error);
          toast.error("Error loading store settings");
        } finally {
          setLoadingStoreSettings(false);
        }
      };

      loadStoreSettings();
    }
  }, [shopkeeperUser, updateStoreSettings]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg text-blue-300">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <PageBackground darkMode className="min-h-screen">
      {/* Background effects */}
      <GlowCircle className="w-[400px] h-[400px] bg-blue-800/20 top-0 right-0" />
      <GlowCircle className="w-[300px] h-[300px] bg-blue-800/20 bottom-20 left-10" />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#0f0a1e] p-4 border-b border-blue-900/30 relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {storeSettings?.logoUrl && (
              <div className="h-10 w-10 bg-blue-900/40 rounded-full flex items-center justify-center overflow-hidden border border-blue-700/30 mr-3">
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
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                {storeSettings?.storeName || "SmartStock"}
              </h1>
              <p className="text-sm text-blue-300/70">Shopkeeper: {shopkeeperUser?.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-red-300 hover:text-red-200 hover:bg-red-900/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-900/20 border-blue-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                <Package className="h-4 w-4 mr-2 text-blue-400" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{products?.length || 0}</div>
              <p className="text-xs text-blue-300/70 mt-1">
                Across {categories?.length || 0} categories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-blue-400" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(
                  products?.reduce((total, product) =>
                    total + (product.unitPrice * product.quantityInStock), 0) || 0
                )}
              </div>
              <p className="text-xs text-blue-300/70 mt-1">
                Total value
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2 text-green-400" />
                Sales Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate("/shopkeeper-pos")}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Open POS
              </Button>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsReceiptHistoryOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Receipt History
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                <Settings className="h-4 w-4 mr-2 text-blue-400" />
                Store Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-200">
              {loading || storeLoading || loadingStoreSettings ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <p>Loading store info...</p>
                </div>
              ) : (
                <>
                  <p className="truncate">{storeSettings?.location || "Location not set"}</p>
                  <p className="truncate">{storeSettings?.phoneNumber || "Phone not set"}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Search and Grid */}
        <div className="mt-8">
          <ShopkeeperHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onCartClick={() => setIsCartOpen(true)}
          />

          <ProductGrid
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />

          <ShoppingCartComponent
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />

          <ReceiptHistory
            isOpen={isReceiptHistoryOpen}
            onClose={() => setIsReceiptHistoryOpen(false)}
          />
        </div>
      </main>
    </PageBackground>
  );
};

const ShopkeeperDashboard = () => {
  return (
    <CartProvider>
      <ShopkeeperDashboardContent />
    </CartProvider>
  );
};

export default ShopkeeperDashboard;

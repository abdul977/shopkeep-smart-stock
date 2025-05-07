import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInventory, InventoryProvider } from "@/contexts/InventoryContext";
import { CartProvider } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import ProductGrid from "@/components/shopkeeper/ProductGrid";
import ShopkeeperHeader from "@/components/shopkeeper/ShopkeeperHeader";
import ShoppingCart from "@/components/shopkeeper/ShoppingCart";
import StoreInfo from "@/components/shopkeeper/StoreInfo";

const ShopkeeperContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [storeNotFound, setStoreNotFound] = useState(false);
  const { loading: inventoryLoading } = useInventory();
  const { user } = useAuth();
  const { getStoreByShareId, storeSettings } = useStore();
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();

  // Load store data based on shareId
  useEffect(() => {
    const loadStore = async () => {
      try {
        // Check if we're in direct user ID access mode
        const pathname = window.location.pathname;
        const directUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';
        const isDirectAccess = pathname.includes(`/shop/${directUserId}`);

        // Case 1: Direct user ID access from URL path
        if (isDirectAccess) {
          console.log('Loading store for direct user ID access from URL path');
          const store = await getStoreByShareId(directUserId);
          if (!store) {
            console.error('Store not found for direct user ID access');
            setStoreNotFound(true);
            return;
          }
          console.log('Store loaded successfully for direct access:', store);
          setStoreLoaded(true);
          return;
        }

        // Case 2: Direct user ID access via parameter
        if (shareId === directUserId) {
          console.log('Loading store for direct user ID access via parameter:', shareId);
          const store = await getStoreByShareId(directUserId);
          if (!store) {
            console.error('Store not found for direct user ID access via parameter');
            setStoreNotFound(true);
            return;
          }
          console.log('Store loaded successfully for direct access via parameter:', store);
          setStoreLoaded(true);
          return;
        }

        // Case 3: No shareId provided, use default store
        if (!shareId) {
          console.log('No shareId provided, using default store');
          setStoreLoaded(true);
          return;
        }

        // Case 4: Regular shareId access
        console.log('Loading store for shareId:', shareId);
        const store = await getStoreByShareId(shareId);
        if (!store) {
          console.error('Store not found for shareId:', shareId);
          setStoreNotFound(true);
          return;
        }

        console.log('Store loaded successfully:', store);
        setStoreLoaded(true);
      } catch (error) {
        console.error("Error loading store:", error);
        setStoreNotFound(true);
      }
    };

    loadStore();
  }, [shareId, getStoreByShareId]);

  // Set page title
  useEffect(() => {
    if (storeSettings) {
      document.title = `${storeSettings.storeName} - Shop`;
    } else {
      document.title = "ShopKeep Smart Stock - Shop";
    }

    // Restore original title when component unmounts
    return () => {
      document.title = "ShopKeep Smart Stock";
    };
  }, [storeSettings]);

  // Show store not found message
  if (storeNotFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">
            The store you're looking for doesn't exist or the link is invalid.
          </p>
          <button
            onClick={() => navigate('/shop/demo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Demo Shop
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (inventoryLoading || !storeLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <ShopkeeperHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onCartClick={() => setIsCartOpen(true)}
        />

        <main className="container mx-auto px-4 py-6">
          {!user && (!shareId || shareId === 'demo') && !window.location.pathname.includes('5c0d304b-5b84-48a4-a9af-dd0d182cde87') && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-blue-800 text-sm">
              <p className="font-medium">Demo Mode</p>
              <p>You're viewing demo inventory data. <a href="/signup" className="text-blue-600 underline">Sign up</a> to manage your own inventory.</p>
            </div>
          )}

          {storeSettings && (window.location.pathname.includes('5c0d304b-5b84-48a4-a9af-dd0d182cde87') || (shareId && shareId !== 'demo')) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 text-blue-800">
              <div className="flex items-center gap-3">
                {storeSettings.logoUrl && (
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-blue-200">
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
                  <p className="font-medium text-lg">{storeSettings.storeName}</p>
                  {storeSettings.location && <p className="text-sm">{storeSettings.location}</p>}
                  {storeSettings.phoneNumber && <p className="text-sm">{storeSettings.phoneNumber}</p>}
                </div>
              </div>
            </div>
          )}

          <ProductGrid
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </main>

        <ShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />

        <StoreInfo />
      </div>
    </CartProvider>
  );
};

const Shopkeeper = () => {
  // We need to wrap the ShopkeeperContent in both the InventoryProvider
  // This ensures that the store details are loaded before the inventory data
  return (
    <InventoryProvider>
      <ShopkeeperContent />
    </InventoryProvider>
  );
};

export default Shopkeeper;

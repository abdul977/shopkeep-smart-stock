import { useState, useEffect } from "react";
import { useInventory, InventoryProvider } from "@/contexts/InventoryContext";
import { CartProvider } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import ProductGrid from "@/components/shopkeeper/ProductGrid";
import ShopkeeperHeader from "@/components/shopkeeper/ShopkeeperHeader";
import ShoppingCart from "@/components/shopkeeper/ShoppingCart";
import StoreInfo from "@/components/shopkeeper/StoreInfo";

const ShopkeeperContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { loading } = useInventory();
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = "ShopKeep Smart Stock - Shop";

    // Restore original title when component unmounts
    return () => {
      document.title = "ShopKeep Smart Stock";
    };
  }, []);

  if (loading) {
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
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-blue-800 text-sm">
              <p className="font-medium">Demo Mode</p>
              <p>You're viewing demo inventory data. <a href="/signup" className="text-blue-600 underline">Sign up</a> to manage your own inventory.</p>
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
  return (
    <InventoryProvider>
      <ShopkeeperContent />
    </InventoryProvider>
  );
};

export default Shopkeeper;

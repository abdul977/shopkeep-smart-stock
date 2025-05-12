import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { useOwnerData } from "@/hooks/useOwnerData";
import { PageBackground, GlowCircle, CardContainer } from "@/components/ui/global-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  LogOut,
  Search,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Printer,
  Download,
  History,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/inventory";
import { toast } from "sonner";
import ShopkeeperHeader from "@/components/shopkeeper/ShopkeeperHeader";
import ShoppingCartComponent from "@/components/shopkeeper/ShoppingCart";
import ReceiptHistory from "@/components/shopkeeper/ReceiptHistory";

const ShopkeeperPOSContent = () => {
  const { shopkeeperUser, isShopkeeper, signOut } = useAuth();
  const { products, categories, loading, error } = useOwnerData(shopkeeperUser?.ownerId);
  const { storeSettings } = useStore();
  const {
    items: cart,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotal: getTotalPrice
  } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptHistoryOpen, setIsReceiptHistoryOpen] = useState(false);

  // Redirect if not logged in as shopkeeper
  useEffect(() => {
    if (!isShopkeeper || !shopkeeperUser) {
      navigate("/shopkeeper-login");
    }
  }, [isShopkeeper, shopkeeperUser, navigate]);

  // Set page title
  useEffect(() => {
    if (storeSettings) {
      document.title = `${storeSettings.storeName} - POS`;
    } else {
      document.title = "SmartStock - POS";
    }

    // Restore original title when component unmounts
    return () => {
      document.title = "SmartStock";
    };
  }, [storeSettings]);

  // Filter products based on search term and category
  useEffect(() => {
    if (products) {
      const filtered = products.filter(product => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;

        return matchesSearch && matchesCategory;
      });
      setFilteredProducts(filtered);
    }
  }, [searchTerm, selectedCategory, products]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Open the cart for checkout
    setIsCartOpen(true);
  };

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Open the cart for checkout and printing
    setIsCartOpen(true);
  };

  const handleViewReceiptHistory = () => {
    setIsReceiptHistoryOpen(true);
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
      <GlowCircle className="w-[400px] h-[400px] bg-blue-800/20 top-0 right-0 hidden md:block" />
      <GlowCircle className="w-[300px] h-[300px] bg-blue-800/20 bottom-20 left-10 hidden md:block" />

      {/* Custom Header for POS */}
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#0f0a1e] p-4 border-b border-blue-900/30 relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2 text-blue-300 hover:text-blue-200"
              onClick={() => navigate("/shopkeeper-dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                {storeSettings?.storeName || "SmartStock"} - POS
              </h1>
              <p className="text-sm text-blue-200">Shopkeeper: {shopkeeperUser?.name}</p>
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
        {/* Category Filter and Search */}
        <div className="mb-6">
          <ShopkeeperHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onCartClick={() => {}} // Not used in POS mode
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="lg:col-span-2">

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <CardContainer
                  key={product.id}
                  className="overflow-hidden flex flex-col h-full hover:from-blue-900/50 hover:to-blue-800/30 transition-colors cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex flex-col h-full p-4">
                    <div className="mb-2">
                      {product.imageUrl ? (
                        <div className="w-full h-32 bg-blue-900/40 rounded-md overflow-hidden mb-2">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/300x200?text=No+Image";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-blue-900/40 rounded-md overflow-hidden mb-2 flex items-center justify-center">
                          <div className="text-blue-400 flex flex-col items-center">
                            <ShoppingCart className="h-8 w-8 mb-2" />
                            <span className="text-sm">No image</span>
                          </div>
                        </div>
                      )}
                      <h3 className="font-medium text-blue-100 truncate">{product.name}</h3>
                      <p className="text-xs text-blue-200 truncate">SKU: {product.sku}</p>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="font-bold text-white">{formatCurrency(product.unitPrice)}</span>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContainer>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-blue-200">No products found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Shopping Cart */}
          <div>
            <CardContainer className="sticky top-4">
              <div className="p-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-800/30 mb-4">
                  <h2 className="text-lg font-medium text-blue-200 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-400" />
                    Cart ({getTotalItems()})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-300 hover:text-blue-200"
                    onClick={handleViewReceiptHistory}
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30 mx-auto w-fit">
                      <ShoppingCart className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-blue-200">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between border-b border-blue-800/30 pb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-100 truncate">{item.product.name}</h4>
                          <p className="text-xs text-blue-200">{formatCurrency(item.product.unitPrice)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-blue-100">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.quantityInStock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-red-700/50 bg-red-900/30 text-red-300 hover:bg-red-800/50"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-blue-800/30">
                      <div className="flex justify-between mb-2">
                        <span className="text-blue-200">Subtotal:</span>
                        <span className="text-blue-100">{formatCurrency(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-blue-200">Total:</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(getTotalPrice())}</span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={handleCheckout}
                          disabled={isGeneratingReceipt}
                        >
                          {isGeneratingReceipt ? (
                            <>
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Checkout
                            </>
                          )}
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="text-blue-300 border-blue-700/50 bg-blue-900/30 hover:bg-blue-800/50"
                            onClick={handlePrintReceipt}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-300 border-red-700/50 bg-red-900/30 hover:bg-red-800/50"
                            onClick={clearCart}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContainer>
          </div>
        </div>
      </main>

      {/* Shopping Cart Slide-out */}
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Receipt History Slide-out */}
      <ReceiptHistory
        isOpen={isReceiptHistoryOpen}
        onClose={() => setIsReceiptHistoryOpen(false)}
      />
    </PageBackground>
  );
};

const ShopkeeperPOS = () => {
  return (
    <CartProvider>
      <ShopkeeperPOSContent />
    </CartProvider>
  );
};

export default ShopkeeperPOS;

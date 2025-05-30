import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CardContainer } from "@/components/ui/global-styles";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerData } from "@/hooks/useOwnerData";
import { Product, Category } from "@/types/inventory";

interface ProductGridProps {
  searchTerm: string;
  selectedCategory: string;
}

const ProductGrid = ({ searchTerm, selectedCategory }: ProductGridProps) => {
  const { shopkeeperUser } = useAuth();
  const { products, categories, loading, error } = useOwnerData(shopkeeperUser?.ownerId);
  const { addItem, items, updateQuantity, removeItem } = useCart();

  // Filter products based on search term and selected category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Check if product is in cart
  const getCartItem = (productId: string) => {
    return items.find((item) => item.product.id === productId);
  };

  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product);
    addItem(product);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    console.log("Updating quantity:", productId, newQuantity);
    updateQuantity(productId, newQuantity);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-blue-100">Products</h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-blue-900/30 rounded-lg border border-blue-700/30">
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-blue-100 mb-2">No products found</h3>
            {searchTerm || selectedCategory !== "all" ? (
              <p className="text-blue-300/70 max-w-md">
                Try adjusting your search or category filter.
              </p>
            ) : (
              <p className="text-blue-300/70 max-w-md">
                This store doesn't have any products yet. Please check back later.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const cartItem = getCartItem(product.id);

            return (
              <CardContainer key={product.id} className="overflow-hidden flex flex-col h-full">
                <div className="h-36 sm:h-40 md:h-48 bg-blue-900/40 flex items-center justify-center border-b border-blue-700/30">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-blue-400 flex flex-col items-center">
                      <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-2" />
                      <span className="text-sm sm:text-base">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-blue-300 font-medium mb-1">
                    {getCategoryName(product.categoryId)}
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1 text-blue-100">{product.name}</h3>
                  <p className="text-blue-200 text-xs sm:text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {formatCurrency(product.unitPrice)}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200 mt-1">
                    {product.quantityInStock > 0
                      ? `${product.quantityInStock} ${product.unit}(s) in stock`
                      : "Out of stock"}
                  </div>
                </div>

                <div className="p-3 sm:p-4 pt-0 border-t border-blue-700/30">
                  {cartItem ? (
                    <div className="flex items-center justify-between w-full flex-wrap gap-2">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                          onClick={() => {
                            if (cartItem.quantity > 1) {
                              updateQuantity(product.id, cartItem.quantity - 1);
                            } else {
                              // Remove item if quantity would be 0
                              const updatedItems = items.filter(item => item.product.id !== product.id);
                              // We need to call a function that actually updates the state
                              removeItem(product.id);
                            }
                          }}
                          disabled={cartItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>

                        <span className="mx-2 font-medium text-sm sm:text-base text-blue-100">{cartItem.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                          onClick={() => addItem(product, 1)}
                          disabled={cartItem.quantity >= product.quantityInStock}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        onClick={() => {
                          // Remove the item and add it again with the current quantity
                          // This ensures the cart is updated with the latest product data
                          const currentQuantity = cartItem.quantity;
                          addItem(product, 0); // Add with 0 to just refresh the product data without changing quantity
                        }}
                        disabled={product.quantityInStock <= 0}
                      >
                        Refresh Cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantityInStock <= 0}
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContainer>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

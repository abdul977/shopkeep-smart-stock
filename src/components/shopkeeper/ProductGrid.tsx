import { useInventory } from "@/contexts/InventoryContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { CardContainer } from "@/components/ui/global-styles";

interface ProductGridProps {
  searchTerm: string;
  selectedCategory: string;
}

const ProductGrid = ({ searchTerm, selectedCategory }: ProductGridProps) => {
  const { products, categories } = useInventory();
  const { addItem, items, updateQuantity } = useCart();

  // Filter products based on search term and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Check if product is in cart
  const getCartItem = (productId: string) => {
    return items.find((item) => item.product.id === productId);
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
                  <p className="text-blue-300/70 text-xs sm:text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="text-base sm:text-lg font-bold text-white">
                    {formatCurrency(product.unitPrice)}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-300/70 mt-1">
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
                          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          disabled={cartItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>

                        <span className="mx-2 font-medium text-sm sm:text-base text-blue-100">{cartItem.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= product.quantityInStock}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        onClick={() => {
                          // Instead of adding 1 more, just ensure the current quantity is set
                          // This prevents incrementing the quantity when "Update Cart" is clicked
                          updateQuantity(product.id, cartItem.quantity);
                        }}
                        disabled={product.quantityInStock <= 0 || cartItem.quantity >= product.quantityInStock}
                      >
                        Update Cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => addItem(product)}
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

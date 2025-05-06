import { useState, useEffect } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductGridProps {
  searchTerm: string;
  selectedCategory: string;
}

const ProductGrid = ({ searchTerm, selectedCategory }: ProductGridProps) => {
  const { products, categories } = useInventory();
  const { addItem, items, updateQuantity } = useCart();
  const [gridCols, setGridCols] = useState(4);

  // Adjust grid columns based on screen size
  useEffect(() => {
    const updateGridCols = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGridCols(1); // Mobile: 1 column
      } else if (width < 768) {
        setGridCols(2); // Small tablets: 2 columns
      } else if (width < 1024) {
        setGridCols(3); // Tablets and small laptops: 3 columns
      } else {
        setGridCols(4); // Desktops: 4 columns
      }
    };

    // Initial update
    updateGridCols();

    // Add event listener
    window.addEventListener('resize', updateGridCols);

    // Cleanup
    return () => window.removeEventListener('resize', updateGridCols);
  }, []);

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
      <h2 className="text-xl font-semibold mb-4">Products</h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            {searchTerm || selectedCategory !== "all" ? (
              <p className="text-gray-500 max-w-md">
                Try adjusting your search or category filter.
              </p>
            ) : (
              <p className="text-gray-500 max-w-md">
                This store doesn't have any products yet. Please check back later.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${
          gridCols >= 2 ? 'sm:grid-cols-2' : ''
        } ${
          gridCols >= 3 ? 'md:grid-cols-3' : ''
        } ${
          gridCols >= 4 ? 'lg:grid-cols-4' : ''
        } gap-4 md:gap-6`}>
          {filteredProducts.map((product) => {
            const cartItem = getCartItem(product.id);

            return (
              <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mb-2" />
                      <span>No image</span>
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-primary font-medium mb-1">
                    {getCategoryName(product.categoryId)}
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {formatCurrency(product.unitPrice)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    {product.quantityInStock > 0
                      ? `${product.quantityInStock} ${product.unit}(s) in stock`
                      : "Out of stock"}
                  </div>
                </CardContent>

                <CardFooter className="p-3 sm:p-4 pt-0">
                  {cartItem ? (
                    <div className="flex items-center justify-between w-full flex-wrap gap-2">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          disabled={cartItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>

                        <span className="mx-2 font-medium text-sm sm:text-base">{cartItem.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= product.quantityInStock}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      <Button
                        className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                        onClick={() => addItem(product)}
                        disabled={product.quantityInStock <= 0 || cartItem.quantity >= product.quantityInStock}
                      >
                        Update Cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => addItem(product)}
                      disabled={product.quantityInStock <= 0}
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

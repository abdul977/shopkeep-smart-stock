
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const Categories = () => {
  const { categories, getProductsByCategory, getCategoryValue } = useInventory();

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Product Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const products = getProductsByCategory(category.id);
          const categoryValue = getCategoryValue(category.id);
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 mr-2 text-inventory-primary" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  {category.description || "No description available"}
                </p>
                
                <div className="flex justify-between text-sm font-medium">
                  <div>Products:</div>
                  <div>{products.length}</div>
                </div>
                
                <div className="flex justify-between text-sm font-medium mt-1">
                  <div>Total Value:</div>
                  <div>${categoryValue.toFixed(2)}</div>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Stock Distribution
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {products.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="bg-blue-50 text-inventory-primary text-xs p-1 rounded truncate"
                      >
                        {product.name}
                      </div>
                    ))}
                    {products.length > 3 && (
                      <div className="bg-gray-100 text-gray-500 text-xs p-1 rounded text-center">
                        +{products.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;


import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Category } from "@/types/inventory";
import AddCategoryDialog from "./AddCategoryDialog";
import EditCategoryDialog from "./EditCategoryDialog";

const Categories = () => {
  const { categories, getProductsByCategory, getCategoryValue } = useInventory();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-inventory-primary hover:bg-inventory-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const products = getProductsByCategory(category.id);
          const categoryValue = getCategoryValue(category.id);

          return (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-inventory-primary" />
                    {category.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
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
                  <div>{formatCurrency(categoryValue)}</div>
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

      <AddCategoryDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

export default Categories;

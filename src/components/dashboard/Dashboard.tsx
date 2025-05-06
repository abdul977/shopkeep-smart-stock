
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Package, AlertTriangle, BanknoteIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { products, categories, getLowStockProducts, getTotalInventoryValue } =
    useInventory();

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            <Package className="h-5 w-5 text-inventory-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Stock Items</CardTitle>
            <AlertTriangle className="h-5 w-5 text-inventory-lowStock" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Need immediate restock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inventory Value</CardTitle>
            <BanknoteIcon className="h-5 w-5 text-inventory-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Categories</CardTitle>
            <BarChart className="h-5 w-5 text-inventory-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Product categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${product.quantityInStock === 0 ? 'text-inventory-danger' : 'text-inventory-lowStock'}`}>
                        {product.quantityInStock} {product.unit}s
                      </div>
                      <p className="text-xs text-gray-500">
                        Min: {product.minStockLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                All products are sufficiently stocked!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map(category => {
                const categoryProducts = products.filter(
                  product => product.categoryId === category.id
                );
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">
                        {categoryProducts.length} products
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-inventory-primary h-2 rounded-full"
                        style={{
                          width: `${(categoryProducts.length / products.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

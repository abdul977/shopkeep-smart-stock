
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Package, AlertTriangle, BanknoteIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CardContainer } from "@/components/ui/global-styles";

const Dashboard = () => {
  const { products, categories, getLowStockProducts, getTotalInventoryValue } =
    useInventory();

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 text-blue-100">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <CardContainer>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-blue-300">Total Products</h3>
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{products.length}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              Across {categories.length} categories
            </p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-blue-300">Low Stock Items</h3>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{lowStockProducts.length}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              Need immediate restock
            </p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-blue-300">Inventory Value</h3>
            <BanknoteIcon className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              Total stock value
            </p>
          </div>
        </CardContainer>

        <CardContainer>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-blue-300">Categories</h3>
            <BarChart className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{categories.length}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              Product categories
            </p>
          </div>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CardContainer className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-100">Low Stock Products</h3>
          </div>
          <div>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-blue-900/30 rounded-md border border-blue-800/50">
                    <div>
                      <h3 className="font-medium text-blue-100">{product.name}</h3>
                      <p className="text-sm text-blue-300/70">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${product.quantityInStock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {product.quantityInStock} {product.unit}s
                      </div>
                      <p className="text-xs text-blue-300/70">
                        Min: {product.minStockLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-300/70 text-center py-4">
                All products are sufficiently stocked!
              </p>
            )}
          </div>
        </CardContainer>

        <CardContainer className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-100">Category Breakdown</h3>
          </div>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryProducts = products.filter(
                product => product.categoryId === category.id
              );
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-100">{category.name}</span>
                    <span className="text-sm text-blue-300/70">
                      {categoryProducts.length} products
                    </span>
                  </div>
                  <div className="w-full bg-blue-900/50 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(categoryProducts.length / Math.max(products.length, 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default Dashboard;

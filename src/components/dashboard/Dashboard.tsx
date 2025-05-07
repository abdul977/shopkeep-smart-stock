
import { useInventory } from "@/contexts/InventoryContext";
import { BarChart, Package, AlertTriangle, BanknoteIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CardContainer } from "@/components/ui/global-styles";

const Dashboard = () => {
  const { products, categories, getLowStockProducts, getTotalInventoryValue } =
    useInventory();

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();

  return (
    <div className="p-1 sm:p-6 animate-fade-in w-full">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 text-blue-100 px-1">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 px-0 sm:px-0">
        <CardContainer className="p-2 sm:p-6">
          <div className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-blue-300">Total Products</h3>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          <div>
            <div className="text-lg sm:text-3xl font-bold text-white">{products.length}</div>
            <p className="text-[10px] sm:text-xs text-blue-300/70 mt-1">
              Across {categories.length} categories
            </p>
          </div>
        </CardContainer>

        <CardContainer className="p-2 sm:p-6">
          <div className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-blue-300">Low Stock</h3>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
          </div>
          <div>
            <div className="text-lg sm:text-3xl font-bold text-white">{lowStockProducts.length}</div>
            <p className="text-[10px] sm:text-xs text-blue-300/70 mt-1">
              Need restock
            </p>
          </div>
        </CardContainer>

        <CardContainer className="p-2 sm:p-6">
          <div className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-blue-300">Value</h3>
            <BanknoteIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
          </div>
          <div>
            <div className="text-lg sm:text-3xl font-bold text-white truncate">
              <span className="sm:hidden">{formatCurrency(totalValue, {}, true)}</span>
              <span className="hidden sm:inline">{formatCurrency(totalValue)}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-blue-300/70 mt-1">
              Total value
            </p>
          </div>
        </CardContainer>

        <CardContainer className="p-2 sm:p-6">
          <div className="flex flex-row items-center justify-between pb-1 sm:pb-2">
            <h3 className="text-xs sm:text-sm font-medium text-blue-300">Categories</h3>
            <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          <div>
            <div className="text-lg sm:text-3xl font-bold text-white">{categories.length}</div>
            <p className="text-[10px] sm:text-xs text-blue-300/70 mt-1">
              Categories
            </p>
          </div>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 px-1 sm:px-0">
        <CardContainer className="p-3 sm:p-5">
          <div className="mb-2 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-blue-100">Low Stock Products</h3>
          </div>
          <div>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-blue-900/30 rounded-md border border-blue-800/50">
                    <div className="w-full sm:w-auto">
                      <h3 className="font-medium text-blue-100 text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-blue-300/70 truncate">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right mt-1 sm:mt-0 flex-shrink-0">
                      <div className={`font-bold text-sm sm:text-base ${product.quantityInStock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
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
              <p className="text-blue-300/70 text-center py-4 text-sm">
                All products are sufficiently stocked!
              </p>
            )}
          </div>
        </CardContainer>

        <CardContainer className="p-3 sm:p-5">
          <div className="mb-2 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-blue-100">Category Breakdown</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {categories.map(category => {
              const categoryProducts = products.filter(
                product => product.categoryId === category.id
              );
              return (
                <div key={category.id} className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-blue-100 truncate max-w-[60%]">{category.name}</span>
                    <span className="text-xs sm:text-sm text-blue-300/70">
                      {categoryProducts.length} products
                    </span>
                  </div>
                  <div className="w-full bg-blue-900/50 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
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

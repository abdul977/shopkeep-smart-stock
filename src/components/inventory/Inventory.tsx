
import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, ArrowUp, ArrowDown } from "lucide-react";
import StockUpdateDialog from "./StockUpdateDialog";
import { Product } from "@/types/inventory";

const Inventory = () => {
  const { products, categories } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [updatingProduct, setUpdatingProduct] = useState<Product | null>(null);

  // Filter products based on search term, category, and stock level
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter
      ? product.categoryId === categoryFilter
      : true;

    const matchesStock = stockFilter
      ? stockFilter === "low"
        ? product.quantityInStock <= product.minStockLevel
        : stockFilter === "out"
        ? product.quantityInStock === 0
        : true
      : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 grid gap-3 grid-cols-1 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stock level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stock Levels</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const category = categories.find(
                (c) => c.id === product.categoryId
              );
              const isLowStock = product.quantityInStock <= product.minStockLevel;
              const isOutOfStock = product.quantityInStock === 0;

              return (
                <div
                  key={product.id}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      {isOutOfStock ? (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-inventory-danger">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-inventory-lowStock">
                          Low stock
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {category?.name} • SKU: {product.sku}
                    </p>
                  </div>

                  <div className="flex items-center mt-3 sm:mt-0">
                    <div className="text-right mr-8">
                      <div className="text-lg font-semibold">
                        {product.quantityInStock} {product.unit}
                        {product.quantityInStock !== 1 ? "s" : ""}
                      </div>
                      <p className="text-xs text-gray-500">Min: {product.minStockLevel}</p>
                    </div>
                    <Button
                      onClick={() => setUpdatingProduct(product)}
                      className="bg-inventory-primary hover:bg-inventory-primary/90"
                    >
                      Update Stock
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {updatingProduct && (
        <StockUpdateDialog
          product={updatingProduct}
          open={!!updatingProduct}
          onOpenChange={() => setUpdatingProduct(null)}
        />
      )}
    </div>
  );
};

export default Inventory;


import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Package } from "lucide-react";
import AddProductDialog from "./AddProductDialog";
import EditProductDialog from "./EditProductDialog";
import { Product } from "@/types/inventory";

const Products = () => {
  const { products, categories } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all"
      ? true
      : product.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="mt-4 sm:mt-0 bg-inventory-primary hover:bg-inventory-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, SKU or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const category = categories.find(
                    (c) => c.id === product.categoryId
                  );

                  const isLowStock =
                    product.quantityInStock <= product.minStockLevel;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-sm">{product.sku}</TableCell>
                      <TableCell>{category?.name}</TableCell>
                      <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            isLowStock
                              ? "text-inventory-danger font-medium"
                              : ""
                          }
                        >
                          {product.quantityInStock}
                        </span>
                        {isLowStock && (
                          <span className="ml-2 text-xs bg-red-100 text-inventory-danger px-2 py-1 rounded-full">
                            Low
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;

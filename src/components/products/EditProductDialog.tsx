
import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Product, Unit } from "@/types/inventory";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const unitOptions: Unit[] = ["piece", "packet", "kg", "liter", "box", "dozen"];

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { categories, updateProduct, deleteProduct } = useInventory();
  
  const [formData, setFormData] = useState({
    ...product,
    unitPrice: product.unitPrice.toString(),
    quantityInStock: product.quantityInStock.toString(),
    minStockLevel: product.minStockLevel.toString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for the field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Clear error for the field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.unitPrice || isNaN(parseFloat(formData.unitPrice))) {
      newErrors.unitPrice = "Valid price is required";
    }
    if (!formData.quantityInStock || isNaN(parseInt(formData.quantityInStock))) {
      newErrors.quantityInStock = "Valid quantity is required";
    }
    if (!formData.minStockLevel || isNaN(parseInt(formData.minStockLevel))) {
      newErrors.minStockLevel = "Valid minimum stock is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateProduct({
        ...product,
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,
        categoryId: formData.categoryId,
        unitPrice: parseFloat(formData.unitPrice),
        unit: formData.unit as Unit,
        quantityInStock: parseInt(formData.quantityInStock),
        minStockLevel: parseInt(formData.minStockLevel),
        imageUrl: formData.imageUrl,
      });
      
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteProduct(product.id);
      onOpenChange(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU*</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={errors.sku ? "border-red-500" : ""}
                />
                {errors.sku && (
                  <p className="text-xs text-red-500">{errors.sku}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                >
                  <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">{errors.categoryId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode (optional)</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price*</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className={`pl-7 ${errors.unitPrice ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="text-xs text-red-500">{errors.unitPrice}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Type*</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value as Unit)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantityInStock">Current Stock*</Label>
                <Input
                  id="quantityInStock"
                  name="quantityInStock"
                  type="number"
                  min="0"
                  value={formData.quantityInStock}
                  onChange={handleChange}
                  className={errors.quantityInStock ? "border-red-500" : ""}
                />
                {errors.quantityInStock && (
                  <p className="text-xs text-red-500">{errors.quantityInStock}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Minimum Stock Level*</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={handleChange}
                className={errors.minStockLevel ? "border-red-500" : ""}
              />
              {errors.minStockLevel && (
                <p className="text-xs text-red-500">{errors.minStockLevel}</p>
              )}
              <p className="text-xs text-gray-500">
                You'll be alerted when stock falls below this level.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              {confirmDelete ? "Confirm Delete" : "Delete Product"}
            </Button>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-inventory-primary hover:bg-inventory-primary/90">
                Update Product
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;

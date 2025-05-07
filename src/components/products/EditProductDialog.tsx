
import { useState, useRef } from "react";
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
import { Image, Upload, X, RefreshCw } from "lucide-react";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const unitOptions: Unit[] = ["piece", "packet", "kg", "liter", "box", "dozen"];

const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { categories, updateProduct, deleteProduct, uploadProductImage } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    ...product,
    unitPrice: product.unitPrice.toString(),
    quantityInStock: product.quantityInStock.toString(),
    minStockLevel: product.minStockLevel.toString(),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Clear any previous image URL
      setFormData({ ...formData, imageUrl: "" });

      // Clear error for the field
      if (errors.imageUrl) {
        setErrors({ ...errors, imageUrl: "" });
      }

      // Automatically upload the file
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File = selectedFile!) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadProductImage(file);
      setFormData({ ...formData, imageUrl });
      setSelectedFile(null);
    } catch (error) {
      setErrors({ ...errors, imageUrl: "Failed to upload image" });
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    // SKU is read-only, so no need to validate
    // Category is optional, so no validation needed
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
      <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-2 sm:mb-4">
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`h-8 sm:h-10 text-sm ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="sku">SKU* (Auto-generated)</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  readOnly
                  className={`h-8 sm:h-10 text-sm bg-gray-50 ${errors.sku ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-gray-500">
                  SKU cannot be changed after product creation.
                </p>
                {errors.sku && (
                  <p className="text-xs text-red-500">{errors.sku}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Select
                  value={formData.categoryId || ""}
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                >
                  <SelectTrigger className={`h-8 sm:h-10 text-sm ${errors.categoryId ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="barcode">Barcode (optional)</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode || ""}
                  onChange={handleChange}
                  className="h-8 sm:h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="unitPrice">Unit Price*</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 sm:top-2.5 text-gray-500">₦</span>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className={`h-8 sm:h-10 text-sm pl-7 ${errors.unitPrice ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="text-xs text-red-500">{errors.unitPrice}</p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="unit">Unit Type*</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange("unit", value as Unit)}
                >
                  <SelectTrigger className="h-8 sm:h-10 text-sm">
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

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="quantityInStock">Current Stock*</Label>
                <Input
                  id="quantityInStock"
                  name="quantityInStock"
                  type="number"
                  min="0"
                  value={formData.quantityInStock}
                  onChange={handleChange}
                  className={`h-8 sm:h-10 text-sm ${errors.quantityInStock ? "border-red-500" : ""}`}
                />
                {errors.quantityInStock && (
                  <p className="text-xs text-red-500">{errors.quantityInStock}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="minStockLevel">Minimum Stock Level*</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={handleChange}
                className={`h-8 sm:h-10 text-sm ${errors.minStockLevel ? "border-red-500" : ""}`}
              />
              {errors.minStockLevel && (
                <p className="text-xs text-red-500">{errors.minStockLevel}</p>
              )}
              <p className="text-xs text-gray-500">
                You'll be alerted when stock falls below this level.
              </p>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="productImage">Product Image (optional)</Label>
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-10 text-xs sm:text-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary mr-1 sm:mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {formData.imageUrl ? "Change Image" : "Select Product Image"}
                      </>
                    )}
                  </Button>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 rounded">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Image className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate font-medium">{selectedFile.name}</p>
                      <p className="text-[10px] sm:text-xs">{Math.round(selectedFile.size / 1024)} KB</p>
                    </div>
                  </div>
                )}

                {formData.imageUrl && (
                  <div className="flex items-center gap-2 sm:gap-3 border rounded p-2 sm:p-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm">Current product image</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{formData.imageUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {errors.imageUrl && (
                <p className="text-xs text-red-500">{errors.imageUrl}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-center">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              {confirmDelete ? "Confirm Delete" : "Delete Product"}
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-8 sm:h-10 text-xs sm:text-sm bg-inventory-primary hover:bg-inventory-primary/90"
              >
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

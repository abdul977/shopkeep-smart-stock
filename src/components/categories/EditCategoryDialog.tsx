import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Category } from "@/types/inventory";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCategoryDialog = ({ category, open, onOpenChange }: EditCategoryDialogProps) => {
  const { updateCategory, deleteCategory } = useInventory();

  const [formData, setFormData] = useState({
    ...category
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateCategory({
        ...category,
        name: formData.name,
        description: formData.description || undefined,
      });

      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteCategory(category.id);
      onOpenChange(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`h-10 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="resize-none"
                placeholder="Describe what types of products belong in this category"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-center">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-10"
            >
              {confirmDelete ? "Confirm Delete" : "Delete Category"}
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 bg-inventory-primary hover:bg-inventory-primary/90"
              >
                Update Category
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;

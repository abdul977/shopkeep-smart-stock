import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { ReportType } from "@/types/inventory";
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

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: "inventory", label: "Inventory Summary" },
  { value: "stock_level", label: "Stock Levels" },
  { value: "category", label: "Category Analysis" },
];

const GenerateReportDialog = ({ open, onOpenChange }: GenerateReportDialogProps) => {
  const { generateReport } = useInventory();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reportType: "inventory" as ReportType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for the field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, reportType: value as ReportType });

    // Clear error for the field
    if (errors.reportType) {
      setErrors({ ...errors, reportType: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.reportType) newErrors.reportType = "Report type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await generateReport(
        formData.title,
        formData.reportType,
        formData.description || undefined
      );

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        reportType: "inventory" as ReportType,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type*</Label>
              <Select
                value={formData.reportType}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className={errors.reportType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reportType && (
                <p className="text-xs text-red-500">{errors.reportType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Add any notes or context for this report"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-inventory-primary hover:bg-inventory-primary/90">
              Generate Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportDialog;


import { useState, useRef } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, PieChart, Package, Archive, FilePlus, Download, Plus, Loader2, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportReportToPdf, exportToPdf } from "@/lib/pdfUtils";
import GenerateReportDialog from "./GenerateReportDialog";
import { ReportType as DatabaseReportType } from "@/types/inventory";
import { toast } from "sonner";

type ReportViewType = "inventory" | "category" | "lowStock" | "saved";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<ReportViewType>("inventory");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedSavedReport, setSelectedSavedReport] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for the tables
  const inventoryTableRef = useRef<HTMLTableElement>(null);
  const categoryTableRef = useRef<HTMLTableElement>(null);
  const lowStockTableRef = useRef<HTMLTableElement>(null);

  const {
    products,
    categories,
    reports,
    getCategoryById,
    getLowStockProducts,
    getTotalInventoryValue,
    getReportsByType
  } = useInventory();

  const lowStockProducts = getLowStockProducts();
  const totalValue = getTotalInventoryValue();
  const savedReports = reports;

  const viewReport = (type: ReportViewType) => {
    setSelectedReport(type);
    setSelectedSavedReport(null);
  };

  // Export inventory report to PDF
  const exportInventoryReport = async () => {
    if (!inventoryTableRef.current) {
      toast.error("No table content to export");
      return;
    }

    try {
      setIsExporting(true);

      const headerContent = `
        <h1>Inventory Valuation Report</h1>
        <p>Total Inventory Value: ${formatCurrency(totalValue)}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `;

      exportReportToPdf(
        "Inventory Valuation Report",
        headerContent,
        inventoryTableRef.current.outerHTML,
        `<p>Report generated from ShopKeep Smart Stock</p>`
      );
    } catch (error) {
      console.error("Error exporting inventory report:", error);
      toast.error("Failed to export inventory report");
    } finally {
      setIsExporting(false);
    }
  };

  // Export category report to PDF
  const exportCategoryReport = async () => {
    if (!categoryTableRef.current) {
      toast.error("No table content to export");
      return;
    }

    try {
      setIsExporting(true);

      const headerContent = `
        <h1>Category Value Breakdown Report</h1>
        <p>Total Inventory Value: ${formatCurrency(totalValue)}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `;

      exportReportToPdf(
        "Category Value Breakdown Report",
        headerContent,
        categoryTableRef.current.outerHTML,
        `<p>Report generated from ShopKeep Smart Stock</p>`
      );
    } catch (error) {
      console.error("Error exporting category report:", error);
      toast.error("Failed to export category report");
    } finally {
      setIsExporting(false);
    }
  };

  // Export low stock report to PDF
  const exportLowStockReport = async () => {
    if (!lowStockTableRef.current) {
      toast.error("No table content to export");
      return;
    }

    try {
      setIsExporting(true);

      const headerContent = `
        <h1>Low Stock Items Report</h1>
        <p>Total Items: ${lowStockProducts.length}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `;

      exportReportToPdf(
        "Low Stock Items Report",
        headerContent,
        lowStockTableRef.current.outerHTML,
        `<p>Report generated from ShopKeep Smart Stock</p>`
      );
    } catch (error) {
      console.error("Error exporting low stock report:", error);
      toast.error("Failed to export low stock report");
    } finally {
      setIsExporting(false);
    }
  };

  // Export saved report to PDF
  const exportSavedReport = async (reportId: string) => {
    const report = savedReports.find(r => r.id === reportId);
    if (!report) {
      toast.error("Report not found");
      return;
    }

    try {
      setIsExporting(true);

      const headerContent = `
        <h1>${report.title}</h1>
        ${report.description ? `<p>${report.description}</p>` : ''}
        <p>Generated on: ${report.createdAt.toLocaleDateString()}</p>
      `;

      const reportContent = `
        <pre style="background-color: #f8f9fa; padding: 1rem; border-radius: 0.25rem; overflow: auto; font-family: monospace; font-size: 0.875rem;">
          ${JSON.stringify(report.data, null, 2)}
        </pre>
      `;

      exportToPdf(
        `<div>${headerContent}${reportContent}</div>`,
        report.title
      );
    } catch (error) {
      console.error("Error exporting saved report:", error);
      toast.error("Failed to export saved report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Reports</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={selectedReport === "inventory" ? "default" : "outline"}
            onClick={() => viewReport("inventory")}
            className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedReport === "inventory" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}`}
            size="sm"
          >
            <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Inventory
          </Button>
          <Button
            variant={selectedReport === "category" ? "default" : "outline"}
            onClick={() => viewReport("category")}
            className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedReport === "category" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}`}
            size="sm"
          >
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Categories
          </Button>
          <Button
            variant={selectedReport === "lowStock" ? "default" : "outline"}
            onClick={() => viewReport("lowStock")}
            className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedReport === "lowStock" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}`}
            size="sm"
          >
            <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Low Stock
          </Button>
          <Button
            variant={selectedReport === "saved" ? "default" : "outline"}
            onClick={() => viewReport("saved")}
            className={`text-xs sm:text-sm h-8 sm:h-9 ${selectedReport === "saved" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}`}
            size="sm"
          >
            <FilePlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Saved
          </Button>
        </div>

        <Button
          onClick={() => setGenerateDialogOpen(true)}
          className="bg-inventory-primary hover:bg-inventory-primary/90 text-xs sm:text-sm h-8 sm:h-9"
          size="sm"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Generate Report
        </Button>
      </div>

      <GenerateReportDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />

      {selectedReport === "inventory" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Inventory Valuation</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportInventoryReport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-4">
              Total Inventory Value: {formatCurrency(totalValue)}
            </div>
            <div className="overflow-x-auto">
              <Table ref={inventoryTableRef}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Product Name</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Category</TableHead>
                    <TableHead className="whitespace-nowrap">Unit Price</TableHead>
                    <TableHead className="whitespace-nowrap">Quantity</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const category = getCategoryById(product.categoryId);
                    const productValue = product.unitPrice * product.quantityInStock;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium whitespace-nowrap">{product.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{product.sku}</TableCell>
                        <TableCell className="hidden md:table-cell">{category?.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="whitespace-nowrap">{product.quantityInStock}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{formatCurrency(productValue)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === "category" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Category Value Breakdown</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCategoryReport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Table ref={categoryTableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Products</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => {
                      const categoryProducts = products.filter(
                        (p) => p.categoryId === category.id
                      );

                      const categoryValue = categoryProducts.reduce(
                        (acc, p) => acc + p.unitPrice * p.quantityInStock,
                        0
                      );

                      const percentage = (categoryValue / totalValue) * 100;

                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{categoryProducts.length}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(categoryValue)}
                            <div className="text-xs text-gray-500">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">{products.length}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalValue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Value Distribution
                </div>
                {categories.map((category) => {
                  const categoryProducts = products.filter(
                    (p) => p.categoryId === category.id
                  );

                  const categoryValue = categoryProducts.reduce(
                    (acc, p) => acc + p.unitPrice * p.quantityInStock,
                    0
                  );

                  const percentage = (categoryValue / totalValue) * 100;

                  return (
                    <div key={category.id} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span>{formatCurrency(categoryValue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-inventory-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === "lowStock" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Low Stock Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLowStockReport}
                disabled={isExporting || lowStockProducts.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <Table ref={lowStockTableRef}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Product Name</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">Category</TableHead>
                    <TableHead className="whitespace-nowrap">Current Stock</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Min. Required</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">Unit Price</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Restock Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const category = getCategoryById(product.categoryId);
                    const shortage = product.minStockLevel - product.quantityInStock;
                    const restockValue = shortage * product.unitPrice;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium whitespace-nowrap">{product.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{category?.name}</TableCell>
                        <TableCell className={`whitespace-nowrap ${product.quantityInStock === 0 ? "text-red-600 font-bold" : "text-amber-600 font-medium"}`}>
                          {product.quantityInStock} {product.unit}
                          {product.quantityInStock !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{product.minStockLevel}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(restockValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={5} className="font-bold text-right">
                      Total Estimated Restock Value:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(
                        lowStockProducts.reduce(
                          (acc, product) =>
                            acc +
                            (product.minStockLevel - product.quantityInStock) *
                              product.unitPrice,
                          0
                        )
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                All products are sufficiently stocked!
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === "saved" && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {savedReports.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Title</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Type</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Created</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">Description</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedReports.map((report) => {
                      const reportTypeLabel =
                        report.reportType === "inventory" ? "Inventory" :
                        report.reportType === "stock_level" ? "Stock Levels" :
                        report.reportType === "category" ? "Category" : "Other";

                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium whitespace-nowrap">{report.title}</TableCell>
                          <TableCell className="hidden sm:table-cell">{reportTypeLabel}</TableCell>
                          <TableCell className="hidden md:table-cell whitespace-nowrap">{report.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell className="truncate max-w-[200px] hidden lg:table-cell">
                            {report.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                                onClick={() => setSelectedSavedReport(report.id)}
                              >
                                <span className="hidden sm:inline">View</span>
                                <Eye className="h-4 w-4 sm:hidden" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                                onClick={() => exportSavedReport(report.id)}
                                disabled={isExporting}
                              >
                                {isExporting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {selectedSavedReport && (() => {
                  const report = savedReports.find(r => r.id === selectedSavedReport);
                  if (!report) return null;

                  return (
                    <Card className="mt-6">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{report.title}</CardTitle>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportSavedReport(report.id)}
                              disabled={isExporting}
                            >
                              {isExporting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              {isExporting ? "Exporting..." : "Export PDF"}
                            </Button>
                            <div className="text-sm text-gray-500">
                              Generated on {report.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {report.description && (
                          <p className="text-sm text-gray-500 mt-2">{report.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                          {JSON.stringify(report.data, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No saved reports yet. Generate a report to save it for future reference.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;

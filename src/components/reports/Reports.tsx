
import { useState } from "react";
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
import { BarChart, PieChart, Package, Archive, FilePlus, Download, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import GenerateReportDialog from "./GenerateReportDialog";
import { ReportType as DatabaseReportType } from "@/types/inventory";

type ReportViewType = "inventory" | "category" | "lowStock" | "saved";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<ReportViewType>("inventory");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedSavedReport, setSelectedSavedReport] = useState<string | null>(null);

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

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Inventory Reports</h1>

      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedReport === "inventory" ? "default" : "outline"}
            onClick={() => viewReport("inventory")}
            className={selectedReport === "inventory" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
          >
            <Package className="h-4 w-4 mr-2" /> Inventory Valuation
          </Button>
          <Button
            variant={selectedReport === "category" ? "default" : "outline"}
            onClick={() => viewReport("category")}
            className={selectedReport === "category" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
          >
            <PieChart className="h-4 w-4 mr-2" /> Category Breakdown
          </Button>
          <Button
            variant={selectedReport === "lowStock" ? "default" : "outline"}
            onClick={() => viewReport("lowStock")}
            className={selectedReport === "lowStock" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
          >
            <Archive className="h-4 w-4 mr-2" /> Low Stock Items
          </Button>
          <Button
            variant={selectedReport === "saved" ? "default" : "outline"}
            onClick={() => viewReport("saved")}
            className={selectedReport === "saved" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
          >
            <FilePlus className="h-4 w-4 mr-2" /> Saved Reports
          </Button>
        </div>

        <Button
          onClick={() => setGenerateDialogOpen(true)}
          className="bg-inventory-primary hover:bg-inventory-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Generate Report
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-4">
              Total Inventory Value: {formatCurrency(totalValue)}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const category = getCategoryById(product.categoryId);
                    const productValue = product.unitPrice * product.quantityInStock;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{category?.name}</TableCell>
                        <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell>{product.quantityInStock}</TableCell>
                        <TableCell className="text-right">{formatCurrency(productValue)}</TableCell>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">Value</TableHead>
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min. Required</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Restock Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const category = getCategoryById(product.categoryId);
                    const shortage = product.minStockLevel - product.quantityInStock;
                    const restockValue = shortage * product.unitPrice;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{category?.name}</TableCell>
                        <TableCell className={product.quantityInStock === 0 ? "text-red-600 font-bold" : "text-amber-600 font-medium"}>
                          {product.quantityInStock} {product.unit}
                          {product.quantityInStock !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell>{product.minStockLevel}</TableCell>
                        <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                        <TableCell className="text-right">
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
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>{reportTypeLabel}</TableCell>
                          <TableCell>{report.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {report.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSavedReport(report.id)}
                            >
                              View
                            </Button>
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
                          <div className="text-sm text-gray-500">
                            Generated on {report.createdAt.toLocaleDateString()}
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

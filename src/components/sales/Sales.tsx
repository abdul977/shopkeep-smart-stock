import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { DollarSign, Users, ShoppingCart, Calendar, Download, Search, Filter, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Shopkeeper } from "@/types/inventory";
import { exportToPdf } from "@/lib/pdfUtils";

// Define types for sales data
type ShopkeeperSales = {
  shopkeeperId: string;
  shopkeeperName: string;
  totalSales: number;
  totalItems: number;
  transactionCount: number;
  lastSaleDate: Date | null;
};

type SaleTransaction = {
  id: string;
  productName: string;
  quantity: number;
  amount: number;
  date: Date;
  receiptNumber: string;
  shopkeeperName: string;
  shopkeeperId: string;
};

const Sales = () => {
  const { user } = useAuth();
  const [shopkeeperSales, setShopkeeperSales] = useState<ShopkeeperSales[]>([]);
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Summary statistics
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSalesData();
      fetchShopkeepers();
    }
  }, [user]);

  const fetchShopkeepers = async () => {
    try {
      const { data, error } = await supabase
        .from('shopkeepers')
        .select('*')
        .eq('owner_id', user?.id)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to match our Shopkeeper type
      const transformedData: Shopkeeper[] = data.map(item => ({
        id: item.id,
        ownerId: item.owner_id,
        email: item.email,
        name: item.name,
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setShopkeepers(transformedData);
    } catch (error: any) {
      console.error("Error fetching shopkeepers:", error);
      toast.error(`Failed to load shopkeepers: ${error.message}`);
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all sales transactions (negative quantity in stock_transactions)
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          id,
          quantity,
          transaction_date,
          notes,
          user_id,
          shopkeeper_id,
          products(name, unit_price, id)
        `)
        .or(`user_id.eq.${user?.id},user_id.is.null`) // Include both user's transactions and null user_id
        .eq('transaction_type', 'sale')
        .lt('quantity', 0) // Sales are recorded as negative quantities
        .order('transaction_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Debug log
      console.log("Fetched transactions:", data);

      // Fetch shopkeepers first to have their data available
      const { data: shopkeepersData, error: shopkeepersError } = await supabase
        .from('shopkeepers')
        .select('*')
        .eq('owner_id', user?.id);

      if (shopkeepersError) {
        console.error("Error fetching shopkeepers:", shopkeepersError);
      }

      // Debug log
      console.log("Fetched shopkeepers:", shopkeepersData);

      // Create a map of shopkeeper IDs to names for quick lookup
      const shopkeeperMap = new Map<string, string>();
      if (shopkeepersData) {
        shopkeepersData.forEach(shopkeeper => {
          shopkeeperMap.set(shopkeeper.id, shopkeeper.name);
        });
      }

      // Process the transactions
      const processedTransactions: SaleTransaction[] = [];
      const shopkeeperSalesMap = new Map<string, ShopkeeperSales>();
      let totalSalesAmount = 0;
      let totalItemsCount = 0;

      data.forEach(transaction => {
        // Extract receipt number and shopkeeper info from notes
        const receiptMatch = transaction.notes?.match(/Receipt #(REC-\d+)/) || [];
        const receiptNumber = receiptMatch[1] || 'Unknown';

        // Extract shopkeeper name from notes or use default
        let shopkeeperName = 'Unknown';
        let shopkeeperId = 'unknown';

        // Debug log
        console.log("Processing transaction:", transaction);

        // First check if we have a direct shopkeeper_id reference
        if (transaction.shopkeeper_id) {
          shopkeeperId = transaction.shopkeeper_id;
          console.log("Found direct shopkeeper_id reference:", shopkeeperId);

          // Look up the shopkeeper name in our map
          if (shopkeeperMap.has(shopkeeperId)) {
            shopkeeperName = shopkeeperMap.get(shopkeeperId) || 'Unknown Shopkeeper';
            console.log("Using shopkeeper name from map:", shopkeeperName);
          }
        }
        // If no direct reference, try to extract from notes
        else if (transaction.notes?.includes('via shopkeeper interface')) {
          // This is a shopkeeper sale, try to extract more info
          const shopkeeperIdMatch = transaction.notes?.match(/Shopkeeper ID: ([a-f0-9-]+)/) || [];
          if (shopkeeperIdMatch[1]) {
            shopkeeperId = shopkeeperIdMatch[1];
            console.log("Found shopkeeper ID in notes:", shopkeeperId);
          }

          const shopkeeperNameMatch = transaction.notes?.match(/Shopkeeper: ([^,.]+)/) || [];
          if (shopkeeperNameMatch[1]) {
            shopkeeperName = shopkeeperNameMatch[1].trim();
            console.log("Found shopkeeper name in notes:", shopkeeperName);
          }

          // If we have the shopkeeper in our map, use that name instead
          if (shopkeeperMap.has(shopkeeperId)) {
            shopkeeperName = shopkeeperMap.get(shopkeeperId) || shopkeeperName;
            console.log("Using shopkeeper name from map:", shopkeeperName);
          }
        }

        // If we have a user_id in the transaction but no shopkeeper info, mark as store owner
        if (transaction.user_id && shopkeeperId === 'unknown') {
          // This might be a transaction by the store owner
          shopkeeperName = 'Store Owner';
          shopkeeperId = transaction.user_id;
          console.log("Using user_id as shopkeeper ID:", shopkeeperId);
        }

        // Calculate the sale amount
        const quantity = Math.abs(transaction.quantity);
        const unitPrice = transaction.products?.unit_price || 0;
        const amount = quantity * unitPrice;

        // Add to processed transactions
        processedTransactions.push({
          id: transaction.id,
          productName: transaction.products?.name || 'Unknown Product',
          quantity: quantity,
          amount: amount,
          date: new Date(transaction.transaction_date),
          receiptNumber,
          shopkeeperName,
          shopkeeperId
        });

        // Update shopkeeper sales summary
        if (!shopkeeperSalesMap.has(shopkeeperId)) {
          shopkeeperSalesMap.set(shopkeeperId, {
            shopkeeperId,
            shopkeeperName,
            totalSales: 0,
            totalItems: 0,
            transactionCount: 0,
            lastSaleDate: null
          });
        }

        const shopkeeperData = shopkeeperSalesMap.get(shopkeeperId)!;
        shopkeeperData.totalSales += amount;
        shopkeeperData.totalItems += quantity;
        shopkeeperData.transactionCount += 1;

        // Update last sale date if this transaction is newer
        if (!shopkeeperData.lastSaleDate ||
            new Date(transaction.transaction_date) > shopkeeperData.lastSaleDate) {
          shopkeeperData.lastSaleDate = new Date(transaction.transaction_date);
        }

        // Update totals
        totalSalesAmount += amount;
        totalItemsCount += quantity;
      });

      // Set state with processed data
      setTransactions(processedTransactions);
      setShopkeeperSales(Array.from(shopkeeperSalesMap.values()));
      setTotalSales(totalSalesAmount);
      setTotalTransactions(data.length);
      setTotalItems(totalItemsCount);
    } catch (error: any) {
      console.error("Error fetching sales data:", error);
      setError(`Failed to load sales data: ${error.message}`);
      toast.error(`Failed to load sales data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search term
    if (searchTerm && !transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.shopkeeperName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by shopkeeper
    if (selectedShopkeeper !== "all") {
      if (selectedShopkeeper === "unknown") {
        // Show transactions with unknown shopkeeper
        return transaction.shopkeeperId === "unknown";
      } else if (transaction.shopkeeperId !== selectedShopkeeper) {
        return false;
      }
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const transactionDate = new Date(transaction.date);

      if (dateRange === "today") {
        return transactionDate.toDateString() === now.toDateString();
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return transactionDate >= weekAgo;
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return transactionDate >= monthAgo;
      }
    }

    return true;
  }).sort((a, b) => {
    // Sort by selected field
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    } else {
      return sortOrder === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
  });

  // Export sales report to PDF
  const exportSalesReport = () => {
    try {
      const title = "Sales Report by Shopkeeper";

      // Create the content for the PDF
      let content = `
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Sales: ${formatCurrency(totalSales)}</p>
        <p>Total Transactions: ${totalTransactions}</p>
        <p>Total Items Sold: ${totalItems}</p>

        <h2>Sales by Shopkeeper</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th>Shopkeeper</th>
              <th>Total Sales</th>
              <th>Items Sold</th>
              <th>Transactions</th>
              <th>Last Sale</th>
            </tr>
          </thead>
          <tbody>
      `;

      shopkeeperSales.forEach(shopkeeper => {
        content += `
          <tr>
            <td>${shopkeeper.shopkeeperName}</td>
            <td>${formatCurrency(shopkeeper.totalSales)}</td>
            <td>${shopkeeper.totalItems}</td>
            <td>${shopkeeper.transactionCount}</td>
            <td>${shopkeeper.lastSaleDate ? format(shopkeeper.lastSaleDate, 'dd/MM/yyyy') : 'N/A'}</td>
          </tr>
        `;
      });

      content += `
          </tbody>
        </table>
      `;

      // Export to PDF
      exportToPdf(content, title);
      toast.success("Sales report exported successfully");
    } catch (error) {
      console.error("Error exporting sales report:", error);
      toast.error("Failed to export sales report");
    }
  };

  return (
    <div className="p-1 sm:p-6 animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-100">Sales by Shopkeeper</h1>
        <Button
          onClick={exportSalesReport}
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-900/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              From {totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              Active Shopkeepers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{shopkeeperSales.length}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              With recorded sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-blue-400" />
              Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalItems}</div>
            <p className="text-xs text-blue-300/70 mt-1">
              Total quantity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
          <Input
            placeholder="Search by product, shopkeeper or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-blue-900/20 border-blue-800/30 text-blue-100"
          />
        </div>

        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-[180px] bg-blue-900/20 border-blue-800/30 text-blue-100">
            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedShopkeeper} onValueChange={setSelectedShopkeeper}>
          <SelectTrigger className="w-[180px] bg-blue-900/20 border-blue-800/30 text-blue-100">
            <Users className="h-4 w-4 mr-2 text-blue-400" />
            <SelectValue placeholder="Shopkeeper" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shopkeepers</SelectItem>
            <SelectItem value="unknown">Unknown shopkeepers</SelectItem>
            {user?.id && <SelectItem value={user.id}>Store Owner</SelectItem>}
            {shopkeepers.map(shopkeeper => (
              <SelectItem key={shopkeeper.id} value={shopkeeper.id}>
                {shopkeeper.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sales by Shopkeeper Table */}
      <Card className="mb-8 bg-blue-900/20 border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-blue-100">Sales by Shopkeeper</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 py-4">{error}</div>
          ) : shopkeeperSales.length === 0 ? (
            <div className="text-blue-300 py-4 text-center">No sales data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-blue-800/30 border-blue-800/30">
                    <TableHead className="text-blue-300">Shopkeeper</TableHead>
                    <TableHead className="text-blue-300">Total Sales</TableHead>
                    <TableHead className="text-blue-300">Items Sold</TableHead>
                    <TableHead className="text-blue-300">Transactions</TableHead>
                    <TableHead className="text-blue-300">Last Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopkeeperSales.map((shopkeeper) => (
                    <TableRow key={shopkeeper.shopkeeperId} className="hover:bg-blue-800/30 border-blue-800/30">
                      <TableCell className="font-medium text-blue-100">{shopkeeper.shopkeeperName}</TableCell>
                      <TableCell className="text-blue-100">{formatCurrency(shopkeeper.totalSales)}</TableCell>
                      <TableCell className="text-blue-100">{shopkeeper.totalItems}</TableCell>
                      <TableCell className="text-blue-100">{shopkeeper.transactionCount}</TableCell>
                      <TableCell className="text-blue-100">
                        {shopkeeper.lastSaleDate
                          ? format(shopkeeper.lastSaleDate, 'dd/MM/yyyy')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sales Transactions */}
      <Card className="bg-blue-900/20 border-blue-800/30">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-blue-100">Recent Sales Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-300 border-blue-800/30"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-300 border-blue-800/30"
              onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Sort by {sortBy === 'date' ? 'Date' : 'Amount'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 py-4">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-blue-300 py-4 text-center">No transactions match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-blue-800/30 border-blue-800/30">
                    <TableHead className="text-blue-300">Date</TableHead>
                    <TableHead className="text-blue-300">Receipt #</TableHead>
                    <TableHead className="text-blue-300">Shopkeeper</TableHead>
                    <TableHead className="text-blue-300">Product</TableHead>
                    <TableHead className="text-blue-300">Quantity</TableHead>
                    <TableHead className="text-blue-300 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-blue-800/30 border-blue-800/30">
                      <TableCell className="text-blue-100">
                        {format(transaction.date, 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-blue-100">{transaction.receiptNumber}</TableCell>
                      <TableCell className="text-blue-100">{transaction.shopkeeperName}</TableCell>
                      <TableCell className="text-blue-100">{transaction.productName}</TableCell>
                      <TableCell className="text-blue-100">{transaction.quantity}</TableCell>
                      <TableCell className="text-blue-100 text-right">{formatCurrency(transaction.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;

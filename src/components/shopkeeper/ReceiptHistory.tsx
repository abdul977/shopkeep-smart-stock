import { useState, useEffect } from "react";
import { useCart, SavedReceipt, CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Receipt as ReceiptIcon, X, Search, Calendar, ChevronDown, Loader2 } from "lucide-react";
import Receipt from "./Receipt";
import { GlowCircle } from "@/components/landing/LandingSvgs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/types/inventory";
import { toast } from "sonner";

interface ReceiptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptHistory = ({ isOpen, onClose }: ReceiptHistoryProps) => {
  const { savedReceipts } = useCart();
  const { user, shopkeeperUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedReceipt, setSelectedReceipt] = useState<SavedReceipt | null>(null);
  const [dbReceipts, setDbReceipts] = useState<SavedReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch receipts from database
  useEffect(() => {
    if (isOpen) {
      fetchReceiptsFromDatabase();
    }
  }, [isOpen]);

  const fetchReceiptsFromDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Determine the user ID to use for fetching data
      const userId = shopkeeperUser?.ownerId || user?.id;

      if (!userId) {
        throw new Error("No user ID available");
      }

      // Fetch sales transactions grouped by receipt number
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          id,
          quantity,
          transaction_date,
          notes,
          products(id, name, unit_price, unit, image_url)
        `)
        .eq('user_id', userId)
        .eq('transaction_type', 'sale')
        .lt('quantity', 0) // Sales are recorded as negative quantities
        .order('transaction_date', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setDbReceipts([]);
        setIsLoading(false);
        return;
      }

      // Group transactions by receipt number
      const receiptMap = new Map<string, any[]>();

      data.forEach(transaction => {
        // Extract receipt number from notes
        const notesText = transaction.notes || '';
        const receiptMatch = notesText.match(/Receipt #(REC-\d+)/);
        const receiptNumber = receiptMatch ? receiptMatch[1] : `REC-${Date.now().toString().slice(-8)}`;

        // Extract shopkeeper name from notes
        const shopkeeperMatch = notesText.match(/Shopkeeper: ([^,]+)/);
        const cashierName = shopkeeperMatch ? shopkeeperMatch[1] : 'Unknown';

        if (!receiptMap.has(receiptNumber)) {
          receiptMap.set(receiptNumber, []);
        }

        receiptMap.get(receiptNumber)?.push({
          ...transaction,
          receiptNumber,
          cashierName
        });
      });

      // Convert map to array of receipts
      const receipts: SavedReceipt[] = Array.from(receiptMap.entries()).map(([receiptNumber, transactions]) => {
        // Calculate total and create items array
        let total = 0;
        const items: CartItem[] = transactions.map(transaction => {
          const product: Product = {
            id: transaction.products.id,
            name: transaction.products.name,
            unitPrice: transaction.products.unit_price,
            unit: transaction.products.unit,
            imageUrl: transaction.products.image_url,
            quantityInStock: 0, // Not needed for receipt display
            minStockLevel: 0, // Not needed for receipt display
            sku: '', // Not needed for receipt display
            categoryId: '', // Not needed for receipt display
            createdAt: new Date(), // Not needed for receipt display
            updatedAt: new Date() // Not needed for receipt display
          };

          const quantity = Math.abs(transaction.quantity);
          total += product.unitPrice * quantity;

          return {
            product,
            quantity,
            id: transaction.id
          };
        });

        return {
          id: receiptNumber,
          receiptNumber,
          items,
          total,
          date: new Date(transactions[0].transaction_date),
          cashierName: transactions[0].cashierName,
          paymentMethod: 'Cash' // Default payment method
        };
      });

      setDbReceipts(receipts);
    } catch (err: any) {
      console.error("Error fetching receipts:", err);
      setError(err.message);
      toast.error(`Failed to load receipts: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine database receipts with local storage receipts
  const allReceipts = [...dbReceipts, ...savedReceipts];

  // Filter and sort receipts
  const filteredReceipts = allReceipts
    .filter((receipt) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        receipt.receiptNumber.toLowerCase().includes(searchLower) ||
        receipt.items.some((item) => item.product.name.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      }
    });

  const handleViewReceipt = (receipt: SavedReceipt) => {
    setSelectedReceipt(receipt);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[500] bg-black/80 animate-in fade-in-0 duration-200 data-[state=closed]:pointer-events-none"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-[502] h-full w-[90%] sm:max-w-md p-4 sm:p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border-l border-blue-900/30 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md opacity-90 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1.5 bg-blue-900/50 border border-blue-700/30 text-blue-200 z-50"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Background effects */}
        <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 fixed -top-20 -right-20" />
        <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 fixed bottom-20 -left-20" />

        <div className="mb-4 relative z-10 flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Receipt History</h2>
          <p className="text-sm text-center sm:text-left text-blue-200">
            View your past transactions
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-4 relative z-10">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-blue-900/30 border-blue-700/30 text-blue-100 placeholder:text-blue-400/70"
              />
            </div>
            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
            >
              <SelectTrigger className="w-[100px] bg-blue-900/30 border-blue-700/30 text-blue-100">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-700 text-blue-100">
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-8">
            <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-blue-100">Loading receipts</h3>
            <p className="text-blue-200 mb-6 max-w-[250px]">
              Fetching your transaction history...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-8">
            <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30">
              <X className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-blue-100">Error loading receipts</h3>
            <p className="text-blue-200 mb-6 max-w-[250px]">{error}</p>
            <Button
              onClick={fetchReceiptsFromDatabase}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              Try Again
            </Button>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-8">
            <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30">
              <ReceiptIcon className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-blue-100">No receipts found</h3>
            <p className="text-blue-200 mb-6 max-w-[250px]">
              {allReceipts.length === 0
                ? "You haven't made any sales yet"
                : "No receipts match your search"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-blue-900/30 p-3 rounded-md border border-blue-700/30 hover:bg-blue-800/30 cursor-pointer transition-colors"
                onClick={() => handleViewReceipt(receipt)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm text-blue-100">Receipt #{receipt.receiptNumber}</h4>
                    <p className="text-xs text-blue-300 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(receipt.date, "dd/MM/yyyy HH:mm")}
                    </p>
                    {receipt.cashierName && (
                      <p className="text-xs text-blue-300">
                        Cashier: {receipt.cashierName}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-blue-100">
                    {formatCurrency(receipt.total)}
                  </span>
                </div>
                <div className="text-xs text-blue-300">
                  {receipt.items.length} {receipt.items.length === 1 ? "item" : "items"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReceipt && (
        <Receipt
          data={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </>
  );
};

export default ReceiptHistory;

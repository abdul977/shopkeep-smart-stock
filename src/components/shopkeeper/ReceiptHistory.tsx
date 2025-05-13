import { useState, useEffect, useRef } from "react";
import { format } from 'date-fns';
import { useCart } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { useReactToPrint } from 'react-to-print';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Receipt } from "@/types/sales";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Download, Printer, Loader2 } from "lucide-react";

interface ReceiptHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({ isOpen, onClose }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { storeSettings } = useStore();
  const componentRef = useRef<HTMLDivElement>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sales_receipts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching receipts:", error);
          toast.error("Failed to load receipt history");
        } else {
          setReceipts(data);
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
        toast.error("Failed to load receipt history");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const handleReceiptClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
  });

  const downloadReceipt = async () => {
    if (!selectedReceipt) {
      toast.error("No receipt selected to download.");
      return;
    }

    try {
      const receiptContent = generateReceiptContent(selectedReceipt);
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${selectedReceipt.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt.");
    }
  };

  const generateReceiptContent = (receipt: Receipt): string => {
    let content = `Receipt ID: ${receipt.id}\n`;
    content += `Date: ${format(new Date(receipt.created_at), 'yyyy-MM-dd HH:mm:ss')}\n`;
    content += `Store: ${storeSettings?.storeName || "SmartStock"}\n`;
    content += `------------------------------------------------\n`;
    content += `Items:\n`;

    try {
      const items = JSON.parse(receipt.items) as { product_name: string; quantity: number; unit_price: number; }[];
      items.forEach(item => {
        content += `${item.product_name} x ${item.quantity} - ${formatCurrency(item.unit_price * item.quantity)}\n`;
      });
    } catch (error) {
      console.error("Error parsing receipt items:", error);
      content += "Error displaying items\n";
    }

    content += `------------------------------------------------\n`;
    content += `Total: ${formatCurrency(receipt.total)}\n`;
    return content;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] border-l border-blue-900/30">
        <DrawerHeader>
          <DrawerTitle className="text-blue-200">Receipt History</DrawerTitle>
          <DrawerClose className="text-blue-300 hover:text-blue-100" />
        </DrawerHeader>
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-300" />
              <p className="text-blue-300">Loading receipts...</p>
            </div>
          ) : receipts.length === 0 ? (
            <p className="text-blue-300">No receipts found.</p>
          ) : (
            <div className="space-y-2">
              {receipts.map((receipt) => (
                <Button
                  key={receipt.id}
                  variant="ghost"
                  className="w-full justify-between text-blue-300 hover:bg-blue-900/30"
                  onClick={() => handleReceiptClick(receipt)}
                >
                  Receipt #{receipt.id}
                  <span className="text-sm">{format(new Date(receipt.created_at), 'yyyy-MM-dd HH:mm')}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Details */}
        {selectedReceipt && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] z-10">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Button onClick={handleCloseReceipt} variant="ghost" className="text-blue-300 hover:text-blue-100">
                  Back to History
                </Button>
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadReceipt}
                    variant="outline"
                    className="text-blue-300 border-blue-700/50 bg-blue-900/30 hover:bg-blue-800/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    variant="outline"
                    className="text-blue-300 border-blue-700/50 bg-blue-900/30 hover:bg-blue-800/50"
                  >
                    {isPrinting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Printing...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Receipt
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div ref={componentRef} className="flex-grow overflow-auto p-4 bg-blue-900/20 rounded-md border border-blue-800/30 text-blue-200">
                <h3 className="text-lg font-semibold mb-2">Receipt Details</h3>
                <p>Receipt ID: {selectedReceipt.id}</p>
                <p>Date: {format(new Date(selectedReceipt.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                <p>Store: {storeSettings?.storeName || "SmartStock"}</p>
                <hr className="my-2 border-blue-800/50" />
                <p className="font-medium">Items:</p>
                <ul className="list-none pl-0">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedReceipt.items) as {
                        product_name: string;
                        quantity: number;
                        unit_price: number;
                      }[];
                      return items.map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.product_name} x {item.quantity} - {formatCurrency(item.unit_price * item.quantity)}
                        </li>
                      ));
                    } catch (error) {
                      console.error("Error parsing receipt items:", error);
                      return <li>Error displaying items</li>;
                    }
                  })()}
                </ul>
                <hr className="my-2 border-blue-800/50" />
                <div className="font-bold">Total: {formatCurrency(selectedReceipt.total)}</div>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ReceiptHistory;

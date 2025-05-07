import { useRef, useState, useEffect } from "react";
import { CartItem } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Printer, Download, X, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { GlowCircle } from "@/components/landing/LandingSvgs";
import { toast } from "sonner";

interface ReceiptProps {
  data: {
    items: CartItem[];
    total: number;
    date: Date;
    receiptNumber: string;
  };
  onClose: () => void;
}

const Receipt = ({ data, onClose }: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { storeSettings } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Handle printing
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${data.receiptNumber}`,
    onBeforePrint: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success("Print job sent successfully");
    },
    onPrintError: (errorLocation, error) => {
      setIsPrinting(false);
      toast.error("Failed to print receipt");
    }
  });

  // Handle saving as PDF
  const handleSavePDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsSaving(true);

      // Create a new window with just the receipt content
      const receiptContent = receiptRef.current.innerHTML;
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        toast.error("Failed to create PDF - popup blocked");
        setIsSaving(false);
        return;
      }

      // Add necessary styles to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt-${data.receiptNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 400px;
                margin: 0 auto;
              }
              .receipt-content {
                padding: 15px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .mb-4 { margin-bottom: 16px; }
              .mb-6 { margin-bottom: 24px; }
              .py-1 { padding-top: 4px; padding-bottom: 4px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .grid { display: grid; }
              .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
              .col-span-2 { grid-column: span 2 / span 2; }
              .col-span-3 { grid-column: span 3 / span 3; }
              .col-span-5 { grid-column: span 5 / span 5; }
              .col-span-6 { grid-column: span 6 / span 6; }
              .font-bold { font-weight: bold; }
              .font-medium { font-weight: 500; }
              .text-xs { font-size: 0.75rem; }
              .text-sm { font-size: 0.875rem; }
              .text-base { font-size: 1rem; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .text-gray-500 { color: #6b7280; }
              .border-t { border-top: 1px solid #e5e7eb; }
              .border-b { border-bottom: 1px solid #e5e7eb; }
              .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              .pr-2 { padding-right: 0.5rem; }
              .mt-4 { margin-top: 16px; }
              .mt-6 { margin-top: 24px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .justify-center { justify-content: center; }
              .items-center { align-items: center; }
              .w-16 { width: 4rem; }
              .h-16 { height: 4rem; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .rounded-full { border-radius: 9999px; }
              .overflow-hidden { overflow: hidden; }
              .object-cover { object-fit: cover; }
              .w-full { width: 100%; }
              .h-full { height: 100%; }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-content">
              ${receiptContent}
            </div>
            <script>
              // Auto-print and close when loaded
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  // Don't close the window to allow the user to save as PDF
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Notify user about how to save as PDF
      toast.success("Use your browser's 'Save as PDF' option in the print dialog", {
        duration: 5000
      });

    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("Failed to save receipt as PDF");
    } finally {
      setIsSaving(false);
    }
  };

  // Force re-render when dialog is opened to ensure it's properly initialized
  useEffect(() => {
    // This is just to trigger a re-render
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-md p-3 sm:p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border border-blue-700/30 relative overflow-hidden">
        {/* Background effects */}
        <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 -top-20 -right-20" />
        <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 bottom-20 -left-20" />

        <DialogHeader className="mb-2 sm:mb-4 relative z-10">
          <DialogTitle className="flex justify-between items-center text-base sm:text-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Receipt</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 sm:h-8 sm:w-8 text-blue-300 hover:bg-blue-800/30 hover:text-blue-200">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-blue-300/70 text-center sm:text-left">
            Transaction details for your purchase
          </DialogDescription>
        </DialogHeader>

        <div ref={receiptRef} className="p-3 sm:p-4 bg-white border rounded-md">
          <div className="text-center mb-4 sm:mb-6">
            {storeSettings?.logoUrl && (
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.storeName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold">{storeSettings?.storeName || "ShopKeep Smart Stock"}</h2>
            {storeSettings?.location && (
              <p className="text-gray-500 text-xs sm:text-sm">{storeSettings.location}</p>
            )}
            {storeSettings?.phoneNumber && (
              <p className="text-gray-500 text-xs sm:text-sm">Tel: {storeSettings.phoneNumber}</p>
            )}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Receipt #:</span>
              <span>{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Date:</span>
              <span>{format(data.date, "dd/MM/yyyy HH:mm")}</span>
            </div>
          </div>

          <div className="border-t border-b py-2 mb-4">
            <div className="grid grid-cols-12 text-xs sm:text-sm font-medium mb-2">
              <div className="col-span-5 sm:col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 sm:col-span-2 text-right">Total</div>
            </div>

            {data.items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 text-xs sm:text-sm py-1">
                <div className="col-span-5 sm:col-span-6 truncate pr-2">{item.product.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.product.unitPrice)}</div>
                <div className="col-span-3 sm:col-span-2 text-right">{formatCurrency(item.product.unitPrice * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-gray-500">Subtotal:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-gray-500">Tax:</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-bold">
              <span>Total:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>

          <div className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-center mt-4 relative z-10">
          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm h-9 sm:h-10 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
            onClick={handlePrint}
            disabled={isPrinting || isSaving}
          >
            {isPrinting ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            )}
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-xs sm:text-sm h-9 sm:h-10"
            onClick={handleSavePDF}
            disabled={isPrinting || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            )}
            {isSaving ? "Saving..." : "Save PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Receipt;

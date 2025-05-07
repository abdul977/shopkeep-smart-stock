import { useRef } from "react";
import { CartItem } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Printer, Download, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { GlowCircle } from "@/components/landing/LandingSvgs";

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

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${data.receiptNumber}`,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Print
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-xs sm:text-sm h-9 sm:h-10"
            onClick={handlePrint}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Save PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Receipt;

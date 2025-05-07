import { useState, useEffect } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, Printer, X } from "lucide-react";
import Receipt from "./Receipt";
import { GlowCircle } from "@/components/landing/LandingSvgs";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { updateProductStock } = useInventory();
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: typeof items;
    total: number;
    date: Date;
    receiptNumber: string;
  } | null>(null);

  const handleCheckout = async () => {
    // Generate receipt data
    const receiptData = {
      items: [...items],
      total: getTotal(),
      date: new Date(),
      receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
    };

    setReceiptData(receiptData);

    // Update stock quantities in inventory
    for (const item of items) {
      await updateProductStock(
        item.product.id,
        item.product.quantityInStock - item.quantity,
        "sale",
        `Sold ${item.quantity} ${item.product.unit}(s) via shopkeeper interface`
      );
    }

    // Show receipt
    setShowReceipt(true);

    // Clear cart
    clearCart();
  };

  // Force re-render when isOpen changes to ensure the sheet is properly initialized
  useEffect(() => {
    // This is just to trigger a re-render when isOpen changes
  }, [isOpen]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose} modal={true}>
        <SheetContent side="right" className="w-full sm:max-w-md h-full p-4 sm:p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border-l border-blue-900/30 relative overflow-y-auto">
          {/* Background effects */}
          <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 fixed -top-20 -right-20" />
          <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 fixed bottom-20 -left-20" />

          <SheetHeader className="mb-4 relative z-10">
            <SheetTitle className="text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Shopping Cart</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-8">
              <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30">
                <Trash2 className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-blue-100">Your cart is empty</h3>
              <p className="text-blue-300/70 mb-6 max-w-[250px]">Add some products to your cart to see them here</p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 py-6 px-6"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6 relative z-10">
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 bg-blue-900/30 p-3 rounded-md border border-blue-700/30">
                    <div className="h-16 w-16 sm:h-16 sm:w-16 bg-blue-900/40 rounded flex items-center justify-center flex-shrink-0 border border-blue-700/30 mx-auto sm:mx-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-blue-400 text-xs sm:text-sm">No img</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full mt-2 sm:mt-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm sm:text-base truncate pr-2 text-blue-100">{item.product.name}</h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-blue-400 hover:text-red-400 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm text-blue-300/70 mb-2">
                        {formatCurrency(item.product.unitPrice)} per {item.product.unit}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="mx-2 text-sm font-medium w-6 text-center text-blue-100">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.quantityInStock}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="font-medium text-sm sm:text-base text-white">
                          {formatCurrency(item.product.unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-blue-700/30" />

              <div className="space-y-3 mb-6 relative z-10 bg-blue-900/20 p-3 rounded-md border border-blue-700/30">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-blue-300/70">Subtotal</span>
                  <span className="font-medium text-blue-100">{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-blue-300/70">Tax</span>
                  <span className="font-medium text-blue-100">{formatCurrency(0)}</span>
                </div>
                <Separator className="my-2 bg-blue-700/30" />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span className="text-blue-100">Total</span>
                  <span className="text-white">{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 pt-2 pb-2 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] border-t border-blue-700/30 z-20">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-sm sm:text-base py-4 sm:py-5 mb-2"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-sm sm:text-base border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {showReceipt && receiptData && (
        <Receipt
          data={receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};

export default ShoppingCart;

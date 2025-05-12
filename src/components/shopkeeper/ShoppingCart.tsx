
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, Printer, X, Loader2 } from "lucide-react";
import Receipt from "./Receipt";
import { GlowCircle } from "@/components/landing/LandingSvgs";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerData } from "@/hooks/useOwnerData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, saveReceipt, addItem } = useCart();
  const { shopkeeperUser } = useAuth();
  const { products } = useOwnerData(shopkeeperUser?.ownerId);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: typeof items;
    total: number;
    date: Date;
    receiptNumber: string;
    paymentMethod?: string;
    cashierName?: string;
  } | null>(null);

  // Debug logging to verify items are being properly received
  useEffect(() => {
    console.log("Cart items in ShoppingCart:", items);
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate shopkeeper and owner information first
    if (!shopkeeperUser) {
      toast.error("You must be logged in as a shopkeeper to process transactions");
      return;
    }

    if (!shopkeeperUser.ownerId) {
      toast.error("Missing store owner information. Please log out and log back in.");
      return;
    }

    // Check if any items exceed available stock
    const invalidItems = items.filter(item => {
      const product = products?.find(p => p.id === item.product.id);
      return !product || item.quantity > product.quantityInStock;
    });

    if (invalidItems.length > 0) {
      toast.error(`Some items have insufficient stock: ${invalidItems.map(i => i.product.name).join(', ')}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Generate receipt data with additional details
      const receiptData = {
        items: [...items],
        total: getTotal(),
        date: new Date(),
        receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
        paymentMethod: "Cash", // Default payment method
        cashierName: shopkeeperUser?.name || "Shopkeeper"
      };

      setReceiptData(receiptData);

      // Update stock quantities in inventory
      const transactionPromises = items.map(async (item) => {
        try {
          // Find the product in our products list
          const product = products?.find(p => p.id === item.product.id);
          if (!product) {
            throw new Error(`Product not found: ${item.product.id}`);
          }

          // Calculate new quantity
          const newQuantity = product.quantityInStock - item.quantity;
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }

          // Update the product stock in the database
          const { error } = await supabase
            .from('products')
            .update({
              quantity_in_stock: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.product.id)
            .eq('user_id', shopkeeperUser?.ownerId);

          if (error) {
            throw error;
          }

          // Record the transaction
          console.log("Recording transaction for owner:", shopkeeperUser?.ownerId);

          // Format the transaction notes with detailed information
          const transactionNotes = `Sold ${item.quantity} ${item.product.unit}(s) via shopkeeper interface. Receipt #${receiptData.receiptNumber}. Shopkeeper: ${shopkeeperUser?.name || 'Unknown'}, Shopkeeper ID: ${shopkeeperUser?.id || 'unknown'}`;

          // Log shopkeeper details for debugging
          console.log("Shopkeeper details for transaction:", {
            name: shopkeeperUser?.name,
            id: shopkeeperUser?.id,
            ownerId: shopkeeperUser?.ownerId
          });

          // We already validated shopkeeperUser and ownerId at the beginning of handleCheckout,
          // but let's double-check here to be extra safe
          if (!shopkeeperUser) {
            console.error("Missing shopkeeper user for transaction");
            throw new Error("Missing shopkeeper information. Please log out and log back in.");
          }

          if (!shopkeeperUser.ownerId) {
            console.error("Missing owner ID for shopkeeper transaction");
            throw new Error("Missing owner ID for transaction. Please contact support.");
          }

          if (!shopkeeperUser.id) {
            console.error("Missing shopkeeper ID for transaction");
            throw new Error("Missing shopkeeper ID for transaction. Please contact support.");
          }

          // Verify that the product exists and belongs to the store owner
          const productInInventory = products?.find(p => p.id === item.product.id);
          if (!productInInventory) {
            console.error("Product not found in inventory:", item.product.id);
            throw new Error(`Product "${item.product.name}" not found in inventory. Please refresh and try again.`);
          }

          // Create transaction data with all required fields
          // Ensure user_id is always set and is a string (not null or undefined)
          const ownerId = shopkeeperUser.ownerId;
          if (!ownerId) {
            throw new Error("Owner ID is required for transactions. Please contact support.");
          }

          const transactionData = {
            product_id: item.product.id,
            quantity: -item.quantity, // Negative for sales
            transaction_type: 'sale',
            notes: transactionNotes,
            user_id: ownerId, // Ensure this is set to the store owner's ID
            transaction_date: new Date().toISOString(),
            shopkeeper_id: shopkeeperUser.id // Always include shopkeeper_id
          };

          console.log("Transaction data:", transactionData);

          // Final validation check before sending to database
          if (!transactionData.user_id) {
            console.error("Missing user_id in transaction data:", transactionData);
            throw new Error("Missing user_id for transaction. Please contact support.");
          }

          const { error: transactionError } = await supabase
            .from('stock_transactions')
            .insert(transactionData);

          if (transactionError) {
            console.error("Transaction error details:", transactionError);
            throw new Error(`Failed to record transaction: ${transactionError.message || transactionError.details || JSON.stringify(transactionError)}`);
          }

          return { success: true, productId: item.product.id };
        } catch (error) {
          console.error("Error processing item:", error);
          return {
            success: false,
            productId: item.product.id,
            productName: item.product.name,
            error
          };
        }
      });

      // Wait for all transactions to complete
      const results = await Promise.all(transactionPromises);

      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        // Some items failed to process
        const failedItems = failures.map((f: any) => f.productName).join(', ');
        toast.error(`Failed to process some items: ${failedItems}`);
      } else {
        // All items processed successfully
        toast.success("Checkout completed successfully!");

        // Save the receipt for future reference and local storage
        saveReceipt({
          items: receiptData.items,
          total: receiptData.total,
          date: receiptData.date,
          receiptNumber: receiptData.receiptNumber,
          paymentMethod: receiptData.paymentMethod,
          cashierName: receiptData.cashierName
        });

        // Note: The actual receipt data is already saved to the database through the stock_transactions
        // entries we created above, which include the receipt number in the notes field.

        // Show receipt
        setShowReceipt(true);

        // Clear cart
        clearCart();
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Force re-render when isOpen changes to ensure the sheet is properly initialized
  useEffect(() => {
    // Log the state to help with debugging
    console.log("ShoppingCart isOpen:", isOpen);

    // Debug the DOM to see if the sheet content is being rendered
    if (isOpen) {
      setTimeout(() => {
        const sheetContent = document.querySelector('[data-state="open"] [data-radix-sheet-content]');
        console.log("Sheet content element:", sheetContent);
      }, 100);
    }
  }, [isOpen]);

  // If the cart is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[500] bg-black/80 animate-in fade-in-0 duration-200 data-[state=closed]:pointer-events-none"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-[502] h-full w-[85%] sm:max-w-md p-4 sm:p-6 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white border-l border-blue-900/30 overflow-y-auto animate-in slide-in-from-right duration-300">
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
          <h2 className="text-lg font-semibold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Shopping Cart</h2>
          <p className="text-sm text-center sm:text-left text-blue-200">
            View and manage your selected items
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-8">
            <div className="bg-blue-900/40 p-5 rounded-full mb-5 border border-blue-700/30">
              <Trash2 className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-blue-100">Your cart is empty</h3>
            <p className="text-blue-200 mb-6 max-w-[250px]">Add some products to your cart to see them here</p>
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

                    <div className="text-xs sm:text-sm text-blue-200 mb-2">
                      {formatCurrency(item.product.unitPrice)} per {item.product.unit}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.product.id, item.quantity - 1);
                            } else {
                              removeItem(item.product.id);
                            }
                          }}
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
                          onClick={() => {
                            // Use addItem with 1 to ensure we have the latest product data
                            addItem(item.product, 1);
                          }}
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

            <div className="space-y-3 mb-6 relative z-10 bg-blue-900/40 p-3 rounded-md border border-blue-700/50">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-blue-200">Subtotal</span>
                <span className="font-medium text-blue-100">{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-blue-200">Tax</span>
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
                disabled={isProcessing || items.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Checkout"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm sm:text-base border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                onClick={clearCart}
                disabled={isProcessing || items.length === 0}
              >
                Clear Cart
              </Button>
            </div>
            </>
          )}
      </div>

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

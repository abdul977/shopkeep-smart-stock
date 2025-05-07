
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from "@/types/inventory";
import { toast } from "sonner";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Debug logging whenever items change
  useEffect(() => {
    console.log("Cart items updated:", items);
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    // Validate product and quantity
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }
    
    if (quantity <= 0) {
      quantity = 1;
    }

    // Check if product is already in cart
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Update quantity if product already exists
      const newQuantity = Math.min(existingItem.quantity + quantity, product.quantityInStock);
      updateQuantity(product.id, newQuantity);
      toast.success(`Updated ${product.name} quantity in cart`);
    } else {
      // Add new item to cart
      const newItems = [...items, { product, quantity: Math.min(quantity, product.quantityInStock) }];
      setItems(newItems);
      toast.success(`Added ${product.name} to cart`);
    }
  };

  const removeItem = (productId: string) => {
    if (!productId) return;
    
    const updatedItems = items.filter((item) => item.product.id !== productId);
    setItems(updatedItems);
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId) return;
    
    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, quantity);

    // Find the product to check stock limits
    const item = items.find(item => item.product.id === productId);
    if (item) {
      // Ensure we don't exceed available stock
      const cappedQuantity = Math.min(newQuantity, item.product.quantityInStock);
      
      const updatedItems = items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: cappedQuantity }
          : item
      );

      setItems(updatedItems);
    }
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + item.product.unitPrice * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

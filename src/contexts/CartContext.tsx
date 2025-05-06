import { createContext, useContext, useState, ReactNode } from "react";
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

  const addItem = (product: Product, quantity = 1) => {
    // Check if product is already in cart
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Update quantity if product already exists
      updateQuantity(product.id, existingItem.quantity + quantity);
      toast.success(`Updated ${product.name} quantity in cart`);
    } else {
      // Add new item to cart
      setItems([...items, { product, quantity }]);
      toast.success(`Added ${product.name} to cart`);
    }
  };

  const removeItem = (productId: string) => {
    const updatedItems = items.filter((item) => item.product.id !== productId);
    setItems(updatedItems);
    toast.success("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, quantity);

    const updatedItems = items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setItems(updatedItems);
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

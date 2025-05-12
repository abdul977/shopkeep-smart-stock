import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/inventory";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export type CartItem = {
  product: Product;
  quantity: number;
  id?: string; // Unique identifier for the cart item
};

export type SavedReceipt = {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  receiptNumber: string;
  paymentMethod?: string;
  cashierName?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  savedReceipts: SavedReceipt[];
  saveReceipt: (receipt: Omit<SavedReceipt, 'id'>) => void;
  getSavedReceipt: (id: string) => SavedReceipt | undefined;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([]);

  // Load saved receipts from localStorage on mount
  useEffect(() => {
    const savedReceiptsJson = localStorage.getItem('savedReceipts');
    if (savedReceiptsJson) {
      try {
        // Parse the JSON string and convert date strings back to Date objects
        const parsedReceipts = JSON.parse(savedReceiptsJson);
        const receiptsWithDates = parsedReceipts.map((receipt: any) => ({
          ...receipt,
          date: new Date(receipt.date)
        }));
        setSavedReceipts(receiptsWithDates);
      } catch (error) {
        console.error('Error loading saved receipts:', error);
      }
    }
  }, []);

  // Save receipts to localStorage whenever they change
  useEffect(() => {
    if (savedReceipts.length > 0) {
      localStorage.setItem('savedReceipts', JSON.stringify(savedReceipts));
    }
  }, [savedReceipts]);

  const addItem = (product: Product, quantity = 1) => {
    // Check if product is already in cart
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // If the item exists, remove it first to ensure we have the latest product data
      const filteredItems = items.filter(item => item.product.id !== product.id);

      // Calculate the new quantity
      // If quantity is 0, keep the existing quantity (used for refreshing cart items)
      const newQuantity = quantity === 0
        ? existingItem.quantity
        : existingItem.quantity + quantity;

      // Create a new item with the latest product data and the updated quantity
      setItems([
        ...filteredItems,
        {
          product,
          quantity: newQuantity,
          id: existingItem.id || uuidv4()
        }
      ]);

      if (quantity === 0) {
        toast.success(`Refreshed ${product.name} in cart`);
      } else {
        toast.success(`Updated ${product.name} quantity in cart`);
      }
    } else {
      // Add new item to cart with a unique ID
      setItems([...items, { product, quantity, id: uuidv4() }]);
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

    // Find the item in the cart
    const existingItem = items.find(item => item.product.id === productId);

    if (!existingItem) {
      console.error(`Product with ID ${productId} not found in cart`);
      return;
    }

    // Update the quantity
    const updatedItems = items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setItems(updatedItems);

    // Show a toast notification
    if (newQuantity !== existingItem.quantity) {
      toast.success(`Updated ${existingItem.product.name} quantity to ${newQuantity}`);
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

  const saveReceipt = (receipt: Omit<SavedReceipt, 'id'>) => {
    const newReceipt: SavedReceipt = {
      ...receipt,
      id: uuidv4()
    };

    setSavedReceipts([newReceipt, ...savedReceipts]);
    return newReceipt.id;
  };

  const getSavedReceipt = (id: string) => {
    return savedReceipts.find(receipt => receipt.id === id);
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
        savedReceipts,
        saveReceipt,
        getSavedReceipt,
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

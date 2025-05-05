
import { createContext, useContext, useState, ReactNode } from "react";
import { Product, Category } from "@/types/inventory";
import { products as initialProducts, categories as initialCategories } from "@/data/mockData";
import { toast } from "sonner";

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, quantity: number) => void;
  getCategoryById: (id: string) => Category | undefined;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getProductsByCategory: (categoryId: string) => Product[];
  getTotalInventoryValue: () => number;
  getCategoryValue: (categoryId: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);

  const addProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...product,
      id: `${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([...products, newProduct]);
    toast.success("Product added successfully");
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id
          ? { ...updatedProduct, updatedAt: new Date() }
          : product
      )
    );
    toast.success("Product updated successfully");
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const updateProductStock = (id: string, quantity: number) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? {
              ...product,
              quantityInStock: quantity,
              updatedAt: new Date(),
            }
          : product
      )
    );
    toast.success("Stock updated successfully");
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  const getLowStockProducts = () => {
    return products.filter((product) => product.quantityInStock <= product.minStockLevel);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((product) => product.categoryId === categoryId);
  };

  const getTotalInventoryValue = () => {
    return products.reduce(
      (total, product) => total + product.unitPrice * product.quantityInStock,
      0
    );
  };

  const getCategoryValue = (categoryId: string) => {
    return getProductsByCategory(categoryId).reduce(
      (total, product) => total + product.unitPrice * product.quantityInStock,
      0
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        getCategoryById,
        getProductById,
        getLowStockProducts,
        getProductsByCategory,
        getTotalInventoryValue,
        getCategoryValue,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};

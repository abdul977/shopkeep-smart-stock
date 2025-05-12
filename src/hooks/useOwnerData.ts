import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Category, StockTransaction, Unit, TransactionType } from "@/types/inventory";
import { useAuth } from "@/contexts/AuthContext";

interface OwnerData {
  products: Product[];
  categories: Category[];
  transactions: StockTransaction[];
  loading: boolean;
  error: string | null;
}

export const useOwnerData = (ownerId?: string): OwnerData => {
  const { shopkeeperUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use the provided ownerId or get it from the shopkeeperUser
    const effectiveOwnerId = ownerId || shopkeeperUser?.ownerId;
    
    if (!effectiveOwnerId) {
      setLoading(false);
      setError("No owner ID available");
      return;
    }

    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching data for owner:", effectiveOwnerId);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', effectiveOwnerId);

        if (categoriesError) {
          throw new Error(`Error fetching categories: ${categoriesError.message}`);
        }

        // Transform categories data
        const formattedCategories: Category[] = categoriesData?.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || undefined
        })) || [];

        setCategories(formattedCategories);
        console.log(`Loaded ${formattedCategories.length} categories`);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', effectiveOwnerId);

        if (productsError) {
          throw new Error(`Error fetching products: ${productsError.message}`);
        }

        // Transform products data
        const formattedProducts: Product[] = productsData?.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          sku: product.sku,
          barcode: product.barcode || undefined,
          categoryId: product.category_id,
          unitPrice: Number(product.unit_price),
          unit: product.unit as Unit,
          quantityInStock: product.quantity_in_stock,
          minStockLevel: product.min_stock_level,
          imageUrl: product.image_url || undefined,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at)
        })) || [];

        setProducts(formattedProducts);
        console.log(`Loaded ${formattedProducts.length} products`);

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('stock_transactions')
          .select('*')
          .eq('user_id', effectiveOwnerId);

        if (transactionsError) {
          throw new Error(`Error fetching transactions: ${transactionsError.message}`);
        }

        // Transform transactions data
        const formattedTransactions: StockTransaction[] = transactionsData?.map(transaction => ({
          id: transaction.id,
          productId: transaction.product_id,
          quantity: transaction.quantity,
          transactionType: transaction.transaction_type as TransactionType,
          notes: transaction.notes || undefined,
          transactionDate: new Date(transaction.transaction_date),
          createdAt: new Date(transaction.created_at)
        })) || [];

        setTransactions(formattedTransactions);
        console.log(`Loaded ${formattedTransactions.length} transactions`);

      } catch (err: any) {
        console.error("Error fetching owner data:", err);
        setError(err.message || "Failed to load owner data");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [ownerId, shopkeeperUser]);

  return { products, categories, transactions, loading, error };
};

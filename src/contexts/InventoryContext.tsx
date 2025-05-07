
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Category, Unit, StockTransaction, TransactionType, Report, ReportType } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { categories as mockCategories, products as mockProducts } from "@/data/mockData";

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  transactions: StockTransaction[];
  reports: Report[];
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateProductStock: (id: string, quantity: number, transactionType: TransactionType, notes?: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  getCategoryById: (id: string) => Category | undefined;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getProductsByCategory: (categoryId: string) => Product[];
  getTotalInventoryValue: () => number;
  getCategoryValue: (categoryId: string) => number;
  getTransactionsByProduct: (productId: string) => StockTransaction[];
  addStockTransaction: (transaction: Omit<StockTransaction, "id" | "createdAt">) => Promise<void>;
  generateReport: (title: string, reportType: ReportType, description?: string) => Promise<void>;
  getReportsByType: (reportType: ReportType) => Report[];
  loading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { shareId } = useParams<{ shareId?: string }>();
  const { getStoreByShareId } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeUserId, setStoreUserId] = useState<string | null>(null);

  // First, determine if we're viewing a specific store via shareId
  useEffect(() => {
    const loadStoreData = async () => {
      // Check if we're in direct access mode with the specific user ID
      const pathname = window.location.pathname;
      const isDirectAccess = pathname.includes('/shop/5c0d304b-5b84-48a4-a9af-dd0d182cde87');
      const directUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';

      if (isDirectAccess) {
        console.log('Direct access mode detected in URL');
        setStoreUserId(directUserId);
        return;
      }

      if (shareId) {
        console.log('Loading store data for shareId:', shareId);
        try {
          // Handle demo store
          if (shareId === 'demo') {
            console.log('Using demo store data');
            setProducts(mockProducts);
            setCategories(mockCategories);
            setTransactions([]);
            setReports([]);
            setLoading(false);
            return;
          }

          // If this is a direct user ID access (temporary fix)
          if (shareId === directUserId) {
            console.log('Using direct user ID access:', shareId);
            setStoreUserId(shareId);
            return;
          }

          const store = await getStoreByShareId(shareId);
          console.log('Store data loaded:', store);

          if (store) {
            // Get the user_id from the store settings to load that user's inventory
            const { data, error } = await supabase
              .from('store_settings')
              .select('user_id')
              .eq('share_id', shareId)
              .single();

            if (error) {
              console.error('Error fetching user_id from store_settings:', error);
            }

            if (data && data.user_id) {
              console.log('Found user_id for store:', data.user_id);
              setStoreUserId(data.user_id);
            } else {
              console.error('No user_id found for store with shareId:', shareId);
            }
          } else {
            console.error('No store found with shareId:', shareId);
          }
        } catch (error) {
          console.error('Error loading store data:', error);
        }
      }
    };

    loadStoreData();
  }, [shareId, getStoreByShareId]);

  useEffect(() => {
    // If viewing a shared store, use that store's user_id
    // If user is logged in, use their data
    // Otherwise, use mock data for public display
    console.log('Data loading effect triggered with:', {
      shareId,
      storeUserId,
      hasUser: !!user
    });

    // Check if we're in direct access mode with the specific user ID
    const pathname = window.location.pathname;
    const isDirectAccess = pathname.includes('/shop/5c0d304b-5b84-48a4-a9af-dd0d182cde87');
    const directUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';

    if (isDirectAccess) {
      console.log('Loading data for direct user ID access from URL path');
      fetchStoreData(directUserId);
      return;
    }

    if (shareId === 'demo') {
      console.log('Using demo store data (already loaded)');
      // Demo store data is already loaded in the first useEffect
      return;
    } else if (shareId && storeUserId) {
      console.log('Loading data for specific store with userId:', storeUserId);
      // Load data for the specific store using storeUserId
      fetchStoreData(storeUserId);
    } else if (shareId === directUserId) {
      // Direct access with user ID in URL for unauthenticated users
      console.log('Loading data for direct user ID access (unauthenticated):', shareId);
      fetchStoreData(shareId);
    } else if (user) {
      console.log('Loading data for logged-in user:', user.id);
      // Load data for the logged-in user
      fetchUserData(user.id);
    } else if (!shareId) {
      console.log('Using mock data for public display');
      // Use mock data for public display when not viewing a specific store
      setProducts(mockProducts);
      setCategories(mockCategories);
      setTransactions([]);
      setReports([]);
      setLoading(false);
    } else {
      console.log('No data loading condition met');
    }
  }, [user, shareId, storeUserId]);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch categories for the user
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) {
        throw categoriesError;
      }

      if (categoriesData) {
        const formattedCategories: Category[] = categoriesData.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || undefined
        }));
        setCategories(formattedCategories);
      }

      // Fetch products for the user
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);

      if (productsError) {
        throw productsError;
      }

      if (productsData) {
        const formattedProducts: Product[] = productsData.map(product => ({
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
        }));
        setProducts(formattedProducts);
      }

      // Fetch transactions for the user
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select('*')
        .eq('user_id', userId);

      if (transactionsError) {
        throw transactionsError;
      }

      if (transactionsData) {
        const formattedTransactions: StockTransaction[] = transactionsData.map(transaction => ({
          id: transaction.id,
          productId: transaction.product_id,
          quantity: transaction.quantity,
          transactionType: transaction.transaction_type as TransactionType,
          notes: transaction.notes || undefined,
          transactionDate: new Date(transaction.transaction_date),
          createdAt: new Date(transaction.created_at)
        }));
        setTransactions(formattedTransactions);
      }

      // Fetch reports for the user
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId);

      if (reportsError) {
        throw reportsError;
      }

      if (reportsData) {
        const formattedReports: Report[] = reportsData.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description || undefined,
          reportType: report.report_type as ReportType,
          data: report.data,
          createdAt: new Date(report.created_at),
          updatedAt: new Date(report.updated_at)
        }));
        setReports(formattedReports);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreData = async (userId: string) => {
    console.log('Fetching store data for userId:', userId);
    try {
      setLoading(true);

      // Fetch categories for the store
      console.log('Fetching categories for userId:', userId);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) {
        throw categoriesError;
      }

      if (categoriesData) {
        const formattedCategories: Category[] = categoriesData.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || undefined
        }));
        setCategories(formattedCategories);
      } else {
        // If no categories found, set empty array
        setCategories([]);
      }

      // Fetch products for the store
      console.log('Fetching products for userId:', userId);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);

      console.log('Products data:', productsData);

      if (productsError) {
        throw productsError;
      }

      if (productsData) {
        const formattedProducts: Product[] = productsData.map(product => ({
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
        }));
        setProducts(formattedProducts);
      } else {
        // If no products found, set empty array
        setProducts([]);
      }

      // Fetch transactions for the store
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select('*')
        .eq('user_id', userId);

      if (transactionsError) {
        throw transactionsError;
      }

      if (transactionsData) {
        const formattedTransactions: StockTransaction[] = transactionsData.map(transaction => ({
          id: transaction.id,
          productId: transaction.product_id,
          quantity: transaction.quantity,
          transactionType: transaction.transaction_type as TransactionType,
          notes: transaction.notes || undefined,
          transactionDate: new Date(transaction.transaction_date),
          createdAt: new Date(transaction.created_at)
        }));
        setTransactions(formattedTransactions);
      } else {
        // If no transactions found, set empty array
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store data');

      // Don't fallback to mock data, show empty state instead
      setProducts([]);
      setCategories([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("You must be logged in to add products");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          category_id: product.categoryId,
          unit_price: product.unitPrice,
          unit: product.unit,
          quantity_in_stock: product.quantityInStock,
          min_stock_level: product.minStockLevel,
          image_url: product.imageUrl,
          user_id: user.id // Add user_id to ensure data isolation
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          sku: data.sku,
          barcode: data.barcode || undefined,
          categoryId: data.category_id,
          unitPrice: Number(data.unit_price),
          unit: data.unit as Unit,
          quantityInStock: data.quantity_in_stock,
          minStockLevel: data.min_stock_level,
          imageUrl: data.image_url || undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        setProducts([...products, newProduct]);
        toast.success("Product added successfully");
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!user) {
      toast.error("You must be logged in to update products");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          sku: updatedProduct.sku,
          barcode: updatedProduct.barcode,
          category_id: updatedProduct.categoryId,
          unit_price: updatedProduct.unitPrice,
          unit: updatedProduct.unit,
          quantity_in_stock: updatedProduct.quantityInStock,
          min_stock_level: updatedProduct.minStockLevel,
          image_url: updatedProduct.imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedProduct.id)
        .eq('user_id', user.id); // Ensure we only update the current user's products

      if (error) {
        throw error;
      }

      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id
            ? { ...updatedProduct, updatedAt: new Date() }
            : product
        )
      );
      toast.success("Product updated successfully");
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete products");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure we only delete the current user's products

      if (error) {
        throw error;
      }

      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const updateProductStock = async (id: string, quantity: number, transactionType: TransactionType, notes?: string) => {
    try {
      // Get the current product
      const product = products.find(p => p.id === id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Calculate the quantity change
      const quantityChange = quantity - product.quantityInStock;

      // Determine the user ID to use (either logged-in user, store owner, or direct access)
      let effectiveUserId = storeUserId || (user?.id || null);

      // Check if we're in direct access mode with the specific user ID
      const pathname = window.location.pathname;
      const isDirectAccess = pathname.includes('/shop/5c0d304b-5b84-48a4-a9af-dd0d182cde87');

      if (isDirectAccess && !effectiveUserId) {
        console.log('Using direct access user ID for stock update');
        effectiveUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';
      }

      if (!effectiveUserId) {
        // For demo mode, just update the local state without database changes
        setProducts(
          products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  quantityInStock: quantity,
                  updatedAt: new Date(),
                }
              : p
          )
        );

        // Add the transaction to local state
        const newTransaction: StockTransaction = {
          id: uuidv4(),
          productId: id,
          quantity: quantityChange,
          transactionType,
          notes,
          transactionDate: new Date(),
          createdAt: new Date()
        };

        setTransactions([...transactions, newTransaction]);
        toast.success("Stock updated successfully");
        return;
      }

      // Update the product stock in the database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          quantity_in_stock: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', effectiveUserId);

      if (updateError) {
        throw updateError;
      }

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('stock_transactions')
        .insert([{
          product_id: id,
          quantity: quantityChange,
          transaction_type: transactionType,
          notes: notes,
          transaction_date: new Date().toISOString(),
          user_id: effectiveUserId
        }]);

      if (transactionError) {
        throw transactionError;
      }

      // Update local state
      setProducts(
        products.map((p) =>
          p.id === id
            ? {
                ...p,
                quantityInStock: quantity,
                updatedAt: new Date(),
              }
            : p
        )
      );

      // Add the transaction to local state
      const newTransaction: StockTransaction = {
        id: uuidv4(),
        productId: id,
        quantity: quantityChange,
        transactionType,
        notes,
        transactionDate: new Date(),
        createdAt: new Date()
      };

      setTransactions([...transactions, newTransaction]);

      toast.success("Stock updated successfully");
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
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

  const addCategory = async (category: Omit<Category, "id">) => {
    if (!user) {
      toast.error("You must be logged in to add categories");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          description: category.description,
          user_id: user.id // Add user_id to ensure data isolation
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name,
          description: data.description || undefined
        };

        setCategories([...categories, newCategory]);
        toast.success("Category added successfully");
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    if (!user) {
      toast.error("You must be logged in to update categories");
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updatedCategory.name,
          description: updatedCategory.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedCategory.id)
        .eq('user_id', user.id); // Ensure we only update the current user's categories

      if (error) {
        throw error;
      }

      setCategories(
        categories.map((category) =>
          category.id === updatedCategory.id
            ? updatedCategory
            : category
        )
      );
      toast.success("Category updated successfully");
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) {
      toast.error("You must be logged in to delete categories");
      return;
    }

    try {
      // Check if there are products using this category
      const productsUsingCategory = products.filter(product => product.categoryId === id);

      if (productsUsingCategory.length > 0) {
        toast.error(`Cannot delete category: ${productsUsingCategory.length} products are using it`);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure we only delete the current user's categories

      if (error) {
        throw error;
      }

      setCategories(categories.filter((category) => category.id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    // Create a unique toast ID
    const toastId = `upload-${uuidv4()}`;

    try {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit. Please upload a smaller image.');
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Show upload toast with ID
      toast.loading('Uploading image...', { id: toastId });

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Dismiss the loading toast and show success
      toast.success('Image uploaded successfully', { id: toastId });
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);

      // Dismiss the loading toast and show error
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`, { id: toastId });
      } else {
        toast.error('Failed to upload image', { id: toastId });
      }

      throw error;
    }
  };

  const getTransactionsByProduct = (productId: string): StockTransaction[] => {
    return transactions.filter(transaction => transaction.productId === productId);
  };

  const addStockTransaction = async (transaction: Omit<StockTransaction, "id" | "createdAt">) => {
    if (!user) {
      toast.error("You must be logged in to add transactions");
      return;
    }

    try {
      const { error } = await supabase
        .from('stock_transactions')
        .insert([{
          product_id: transaction.productId,
          quantity: transaction.quantity,
          transaction_type: transaction.transactionType,
          notes: transaction.notes,
          transaction_date: transaction.transactionDate.toISOString(),
          user_id: user.id // Add user_id to ensure data isolation
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the product stock
      const product = products.find(p => p.id === transaction.productId);
      if (product) {
        const newQuantity = product.quantityInStock + transaction.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({
            quantity_in_stock: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.productId);

        if (updateError) {
          throw updateError;
        }

        // Update local state
        setProducts(
          products.map((p) =>
            p.id === transaction.productId
              ? {
                  ...p,
                  quantityInStock: newQuantity,
                  updatedAt: new Date(),
                }
              : p
          )
        );
      }

      // Add to local state
      const newTransaction: StockTransaction = {
        id: uuidv4(),
        ...transaction,
        createdAt: new Date()
      };

      setTransactions([...transactions, newTransaction]);

      toast.success("Transaction recorded successfully");
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to record transaction');
    }
  };

  const generateReport = async (title: string, reportType: ReportType, description?: string) => {
    try {
      // Generate report data based on type
      let reportData: any = {};

      switch (reportType) {
        case 'inventory':
          reportData = {
            totalProducts: products.length,
            totalValue: getTotalInventoryValue(),
            lowStockCount: getLowStockProducts().length,
            categories: categories.map(category => ({
              id: category.id,
              name: category.name,
              productCount: getProductsByCategory(category.id).length,
              value: getCategoryValue(category.id)
            }))
          };
          break;
        case 'stock_level':
          reportData = {
            products: products.map(product => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              quantity: product.quantityInStock,
              minLevel: product.minStockLevel,
              status: product.quantityInStock <= 0 ? 'out_of_stock' :
                     product.quantityInStock <= product.minStockLevel ? 'low_stock' : 'in_stock'
            }))
          };
          break;
        case 'category':
          reportData = {
            categories: categories.map(category => {
              const categoryProducts = getProductsByCategory(category.id);
              return {
                id: category.id,
                name: category.name,
                productCount: categoryProducts.length,
                value: getCategoryValue(category.id),
                products: categoryProducts.map(p => ({
                  id: p.id,
                  name: p.name,
                  quantity: p.quantityInStock,
                  value: p.unitPrice * p.quantityInStock
                }))
              };
            })
          };
          break;
        default:
          reportData = { products, categories };
      }

      // Save to database
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          title,
          description,
          report_type: reportType,
          data: reportData,
          user_id: user.id // Add user_id to ensure data isolation
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newReport: Report = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          reportType: data.report_type as ReportType,
          data: data.data,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        setReports([...reports, newReport]);
        toast.success("Report generated successfully");
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const getReportsByType = (reportType: ReportType): Report[] => {
    return reports.filter(report => report.reportType === reportType);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        transactions,
        reports,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProductStock,
        uploadProductImage,
        getCategoryById,
        getProductById,
        getLowStockProducts,
        getProductsByCategory,
        getTotalInventoryValue,
        getCategoryValue,
        getTransactionsByProduct,
        addStockTransaction,
        generateReport,
        getReportsByType,
        loading
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

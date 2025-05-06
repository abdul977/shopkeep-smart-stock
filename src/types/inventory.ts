
export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type Unit = "piece" | "packet" | "kg" | "liter" | "box" | "dozen";

export type Product = {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  unitPrice: number;
  unit: Unit;
  quantityInStock: number;
  minStockLevel: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoreSettings = {
  id: string;
  storeName: string;
  location?: string;
  phoneNumber?: string;
  logoUrl?: string;
  businessHours?: string;
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionType = "purchase" | "sale" | "adjustment" | "return";

export type StockTransaction = {
  id: string;
  productId: string;
  quantity: number;
  transactionType: TransactionType;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
};

export type ReportType = "inventory" | "sales" | "stock_level" | "category";

export type Report = {
  id: string;
  title: string;
  description?: string;
  reportType: ReportType;
  data: any;
  createdAt: Date;
  updatedAt: Date;
};

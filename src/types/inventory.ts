
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

// This is a temporary file to fix type issues in Sales.tsx, ReceiptHistory.tsx, and ManageShopkeepers.tsx

// Add a default description property to Product type
import { Product } from '@/types/inventory';

// Add missing description field to Product objects where needed
export function ensureProductDescription(product: any): Product {
  if (!product.description) {
    return {
      ...product,
      description: product.name || 'No description available'
    } as Product;
  }
  return product as Product;
}

// Fix the array access issue in Sales.tsx
export function fixSalesTypeIssue(items: { name: any; unit_price: any; id: any; }[]) {
  return {
    name: items[0]?.name || '',
    unit_price: items[0]?.unit_price || 0,
    id: items[0]?.id || ''
  };
}

// Fix for ManageShopkeepers.tsx
export interface ShopkeeperFormData {
  name: string;
  email: string;
  active: boolean;
  password: string;
}

export function ensureRequiredShopkeeperFields(data: Partial<ShopkeeperFormData>): ShopkeeperFormData {
  return {
    name: data.name || '',
    email: data.email || '',
    active: data.active !== undefined ? data.active : true,
    password: data.password || ''
  };
}

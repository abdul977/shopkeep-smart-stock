
export interface Receipt {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerId?: string;
  customerName?: string;
  totalAmount: number;
  items: ReceiptItem[];
  status: 'completed' | 'cancelled' | 'pending';
  paymentMethod?: string;
  notes?: string;
  userId: string;
}

export interface ReceiptItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

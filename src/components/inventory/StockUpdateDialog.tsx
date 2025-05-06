
import { useState } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { Product, TransactionType } from "@/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StockUpdateDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StockUpdateDialog = ({ product, open, onOpenChange }: StockUpdateDialogProps) => {
  const { updateProductStock } = useInventory();
  const [quantity, setQuantity] = useState(product.quantityInStock);
  const [updateType, setUpdateType] = useState<"set" | "add" | "remove">("set");
  const [changeAmount, setChangeAmount] = useState(1);
  const [transactionType, setTransactionType] = useState<TransactionType>("adjustment");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setQuantity(val);
      setError("");
    } else {
      setError("Please enter a valid number");
    }
  };

  const handleChangeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setChangeAmount(val);
      setError("");
    } else {
      setError("Please enter a valid number");
    }
  };

  const handleSubmit = () => {
    let newQuantity = quantity;
    let actualTransactionType = transactionType;

    if (updateType === "set") {
      newQuantity = quantity;
      // If setting to a specific value, always use adjustment
      actualTransactionType = "adjustment";
    } else if (updateType === "add") {
      newQuantity = product.quantityInStock + changeAmount;
      // If adding stock, use purchase or return based on transaction type
      actualTransactionType = transactionType === "adjustment" ? "purchase" : transactionType;
    } else if (updateType === "remove") {
      newQuantity = Math.max(0, product.quantityInStock - changeAmount);
      // If removing stock, use sale or adjustment based on transaction type
      actualTransactionType = transactionType === "purchase" ? "sale" : transactionType;
    }

    updateProductStock(product.id, newQuantity, actualTransactionType, notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock for {product.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={updateType === "set" ? "default" : "outline"}
              onClick={() => setUpdateType("set")}
              className={updateType === "set" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
            >
              Set Exact
            </Button>
            <Button
              variant={updateType === "add" ? "default" : "outline"}
              onClick={() => setUpdateType("add")}
              className={updateType === "add" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
            >
              <ArrowUp className="h-4 w-4 mr-1" /> Add Stock
            </Button>
            <Button
              variant={updateType === "remove" ? "default" : "outline"}
              onClick={() => setUpdateType("remove")}
              className={updateType === "remove" ? "bg-inventory-primary hover:bg-inventory-primary/90" : ""}
            >
              <ArrowDown className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>

          {updateType === "set" ? (
            <div className="space-y-2">
              <Label htmlFor="quantity">New Stock Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="changeAmount">
                {updateType === "add" ? "Amount to Add" : "Amount to Remove"}
              </Label>
              <Input
                id="changeAmount"
                type="number"
                min="0"
                value={changeAmount}
                onChange={handleChangeAmountChange}
              />
              <p className="text-sm text-gray-500">
                Current stock: {product.quantityInStock} {product.unit}
                {product.quantityInStock !== 1 ? "s" : ""}
              </p>
              <p className="text-sm font-medium">
                New stock will be:{" "}
                {updateType === "add"
                  ? product.quantityInStock + changeAmount
                  : Math.max(0, product.quantityInStock - changeAmount)}{" "}
                {product.unit}
                {(updateType === "add"
                  ? product.quantityInStock + changeAmount
                  : Math.max(0, product.quantityInStock - changeAmount)) !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select
              value={transactionType}
              onValueChange={(value) => setTransactionType(value as TransactionType)}
            >
              <SelectTrigger id="transactionType">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this stock update"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-inventory-primary hover:bg-inventory-primary/90">
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateDialog;

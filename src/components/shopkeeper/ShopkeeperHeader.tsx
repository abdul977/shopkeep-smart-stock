import { useState, useEffect } from "react";
import { useInventory } from "@/contexts/InventoryContext";
import { useCart } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart, ArrowLeft, Filter, X } from "lucide-react";

interface ShopkeeperHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onCartClick: () => void;
}

const ShopkeeperHeader = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onCartClick,
}: ShopkeeperHeaderProps) => {
  const { categories } = useInventory();
  const { getTotalItems } = useCart();
  const { storeSettings } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden md:flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {storeSettings?.logoUrl && (
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                <img
                  src={storeSettings.logoUrl}
                  alt={storeSettings.storeName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                  }}
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-blue-600">
              {storeSettings?.storeName || "SmartStock"}
            </h1>
          </div>

          <div className="flex flex-1 max-w-md relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 border-gray-300"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="relative border-gray-300 hover:bg-gray-50"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          {/* Top Row - Logo and Cart */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              {storeSettings?.logoUrl && (
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.storeName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                    }}
                  />
                </div>
              )}
              <h1 className="text-xl font-bold text-blue-600">
                {storeSettings?.storeName || "SmartStock"}
              </h1>
            </div>

            <Button
              variant="outline"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>

          {/* Search Row */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-full border-gray-300"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex-shrink-0"
              aria-label="Filter products"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter Dropdown - Mobile */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-white rounded-md border border-gray-200 shadow-md animate-in slide-in-from-top-5 duration-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">Filter by Category</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-gray-100"
                  aria-label="Close filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className={`w-full justify-start ${selectedCategory === "all" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsFilterOpen(false);
                  }}
                >
                  All Categories
                </Button>

                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`w-full justify-start ${selectedCategory === category.id ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-50"}`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsFilterOpen(false);
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ShopkeeperHeader;

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerData } from "@/hooks/useOwnerData";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { GlowCircle } from "@/components/landing/LandingSvgs";

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
  const { shopkeeperUser } = useAuth();
  const { categories } = useOwnerData(shopkeeperUser?.ownerId);
  const { getTotalItems } = useCart();
  const { storeSettings } = useStore();
  const isMobile = useIsMobile();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <header className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] text-white shadow-md relative overflow-hidden">
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 -top-20 -right-20" />
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 bottom-20 -left-20" />

      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Desktop Header */}
        <div className="hidden md:flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {storeSettings?.logoUrl && (
              <div className="h-10 w-10 bg-blue-900/40 rounded-full flex items-center justify-center overflow-hidden border border-blue-700/30">
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
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              {storeSettings?.storeName || "SmartStock"}
            </h1>
          </div>

          <div className="flex flex-1 max-w-md relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-blue-900/50 border-blue-700/70 text-white placeholder:text-blue-300"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200" />
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] bg-blue-900/30 border-blue-700/50 text-blue-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-blue-700/50 text-blue-200">
                <SelectItem value="all" className="focus:bg-blue-900/50 focus:text-blue-200">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="focus:bg-blue-900/50 focus:text-blue-200">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="relative border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50 hover:text-blue-100 px-4"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
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
            <div className="flex items-center gap-2 max-w-[70%]">
              {storeSettings?.logoUrl && (
                <div className="h-8 w-8 bg-blue-900/40 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-blue-700/30">
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
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200 truncate">
                {storeSettings?.storeName || "SmartStock"}
              </h1>
            </div>

            <Button
              variant="outline"
              className="relative border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50 hover:text-blue-100 h-10 w-10 p-0"
              onClick={onCartClick}
              aria-label="Open shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>

          {/* Search Row */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative min-w-0">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-full bg-blue-900/50 border-blue-700/70 text-white placeholder:text-blue-300 text-sm"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200" />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex-shrink-0 border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50 hover:text-blue-100 h-9 w-9"
              aria-label="Filter products"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Dropdown - Mobile */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-gradient-to-br from-[#1a1a2e] to-[#0f0a1e] rounded-md border border-blue-700/30 shadow-md animate-in slide-in-from-top-5 duration-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-blue-200">Filter by Category</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-blue-800/30 text-blue-300"
                  aria-label="Close filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className={`w-full justify-start text-sm h-9 ${
                    selectedCategory === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                  }`}
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
                    className={`w-full justify-start text-sm h-9 truncate ${
                      selectedCategory === category.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50"
                    }`}
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

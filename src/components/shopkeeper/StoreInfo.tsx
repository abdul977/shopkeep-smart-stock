import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info, X } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

const StoreInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { storeSettings, loading } = useStore();

  return (
    <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50">
      {isOpen ? (
        <Card className="w-[calc(100vw-24px)] max-w-[320px] shadow-lg animate-in slide-in-from-right-10 duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h3 className="font-bold text-base sm:text-lg">Store Information</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2 text-xs text-gray-600">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {storeSettings?.logoUrl && (
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={storeSettings.logoUrl}
                        alt={storeSettings.storeName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                        }}
                      />
                    </div>
                  </div>
                )}
                <p><strong>Store Name:</strong> {storeSettings?.storeName || 'ShopKeep Smart Stock'}</p>
                {storeSettings?.location && <p><strong>Address:</strong> {storeSettings.location}</p>}
                {storeSettings?.phoneNumber && <p><strong>Phone:</strong> {storeSettings.phoneNumber}</p>}
                {storeSettings?.businessHours && <p><strong>Hours:</strong> {storeSettings.businessHours}</p>}
                <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                  This is a public storefront. All prices are in Nigerian Naira (₦).
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-primary hover:bg-primary/90 shadow-lg"
          aria-label="Store Information"
        >
          <Info className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  );
};

export default StoreInfo;

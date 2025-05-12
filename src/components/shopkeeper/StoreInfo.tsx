import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { CardContainer } from "@/components/ui/global-styles";
import { GlowCircle } from "@/components/landing/LandingSvgs";

const StoreInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { storeSettings, loading } = useStore();

  return (
    <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50">
      {isOpen ? (
        <CardContainer className="w-[calc(100vw-24px)] max-w-[320px] shadow-lg animate-in slide-in-from-right-10 duration-300 relative overflow-hidden">
          {/* Background effects */}
          <GlowCircle className="w-[150px] h-[150px] bg-blue-800/20 -top-20 -right-20" />
          <GlowCircle className="w-[150px] h-[150px] bg-blue-800/20 bottom-20 -left-20" />

          <div className="p-3 sm:p-4 relative z-10">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h3 className="font-bold text-base sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Store Information</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 sm:h-8 sm:w-8 text-blue-300 hover:bg-blue-800/30 hover:text-blue-200"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-2 text-xs text-blue-300">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                {storeSettings?.logoUrl && (
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-blue-900/40 rounded-full flex items-center justify-center overflow-hidden border border-blue-700/30">
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
                <p className="text-blue-100"><strong className="text-blue-200">Store Name:</strong> {storeSettings?.storeName || 'ShopKeep Smart Stock'}</p>
                {storeSettings?.location && <p className="text-blue-100"><strong className="text-blue-200">Address:</strong> {storeSettings.location}</p>}
                {storeSettings?.phoneNumber && <p className="text-blue-100"><strong className="text-blue-200">Phone:</strong> {storeSettings.phoneNumber}</p>}
                {storeSettings?.businessHours && <p className="text-blue-100"><strong className="text-blue-200">Hours:</strong> {storeSettings.businessHours}</p>}
                <p className="text-[10px] sm:text-xs text-blue-200 mt-3 sm:mt-4">
                  This is a public storefront. All prices are in Nigerian Naira (₦).
                </p>
              </div>
            )}
          </div>
        </CardContainer>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg"
          aria-label="Store Information"
        >
          <Info className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  );
};

export default StoreInfo;

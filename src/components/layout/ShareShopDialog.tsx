import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareShopDialog = ({ open, onOpenChange }: ShareShopDialogProps) => {
  const shopUrl = `${window.location.origin}/shop`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shopUrl)}`;
  const qrRef = useRef<HTMLImageElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(shopUrl)
      .then(() => {
        toast.success("Shop link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = qrRef.current.width;
      canvas.height = qrRef.current.height;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(qrRef.current, 0, 0);
        
        const link = document.createElement("a");
        link.download = "shopkeep-qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        toast.success("QR code downloaded");
      }
    } catch (error) {
      toast.error("Failed to download QR code");
    } finally {
      setIsDownloading(false);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ShopKeep Smart Stock",
          text: "Check out our shop!",
          url: shopUrl
        });
        toast.success("Link shared successfully");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share link");
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Shop Link</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-2 border rounded-md shadow-sm">
            <img 
              ref={qrRef}
              src={qrCodeUrl} 
              alt="Shop QR Code" 
              className="w-48 h-48"
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="flex w-full items-center space-x-2">
            <Input
              value={shopUrl}
              readOnly
              className="flex-1"
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={copyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Share this link with customers to access your shop. They can scan the QR code or visit the URL directly.
          </p>
        </div>
        
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={downloadQRCode}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download QR"}
          </Button>
          <Button 
            className="flex-1"
            onClick={shareLink}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareShopDialog;

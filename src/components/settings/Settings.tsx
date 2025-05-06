
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserProfile from "@/components/auth/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/contexts/StoreContext";
import { Image, Upload } from "lucide-react";

const Settings = () => {
  const { storeSettings, updateStoreSettings, uploadStoreLogo, loading } = useStore();
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [email, setEmail] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("Groceries");

  // Store settings form state
  const [storeFormData, setStoreFormData] = useState({
    storeName: "",
    location: "",
    phoneNumber: "",
    businessHours: "",
    logoUrl: "",
    shareId: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize store form data when storeSettings is loaded
  useEffect(() => {
    if (storeSettings) {
      setStoreFormData({
        storeName: storeSettings.storeName || "",
        location: storeSettings.location || "",
        phoneNumber: storeSettings.phoneNumber || "",
        businessHours: storeSettings.businessHours || "",
        logoUrl: storeSettings.logoUrl || "",
        shareId: storeSettings.shareId || ""
      });
    }
  }, [storeSettings]);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const handleStoreSettingsSave = async () => {
    try {
      await updateStoreSettings({
        storeName: storeFormData.storeName,
        location: storeFormData.location || undefined,
        phoneNumber: storeFormData.phoneNumber || undefined,
        businessHours: storeFormData.businessHours || undefined,
        logoUrl: storeFormData.logoUrl || undefined,
        shareId: storeFormData.shareId || undefined
      });
    } catch (error) {
      console.error("Error saving store settings:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Clear any previous logo URL
      setStoreFormData({ ...storeFormData, logoUrl: "" });

      // Automatically upload the file
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File = selectedFile!) => {
    if (!file) return;

    try {
      setIsUploading(true);
      const logoUrl = await uploadStoreLogo(file);
      setStoreFormData({ ...storeFormData, logoUrl });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="ml-3 text-gray-600">Loading store settings...</p>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="storeLogo">Store Logo</Label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {storeFormData.logoUrl ? "Change Logo" : "Upload Logo"}
                              </>
                            )}
                          </Button>
                        </div>

                        {storeFormData.logoUrl && (
                          <div className="flex items-center gap-3 border rounded p-3">
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                              <img
                                src={storeFormData.logoUrl}
                                alt="Store logo"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Current store logo</p>
                              <p className="text-xs text-gray-500 truncate">{storeFormData.logoUrl}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setStoreFormData({ ...storeFormData, logoUrl: "" })}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={storeFormData.storeName}
                        onChange={(e) => setStoreFormData({ ...storeFormData, storeName: e.target.value })}
                        placeholder="ShopKeep Smart Stock"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={storeFormData.location}
                        onChange={(e) => setStoreFormData({ ...storeFormData, location: e.target.value })}
                        placeholder="123 Main Street, City"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={storeFormData.phoneNumber}
                        onChange={(e) => setStoreFormData({ ...storeFormData, phoneNumber: e.target.value })}
                        placeholder="+234 123 456 7890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <Textarea
                        id="businessHours"
                        value={storeFormData.businessHours}
                        onChange={(e) => setStoreFormData({ ...storeFormData, businessHours: e.target.value })}
                        placeholder="Mon-Sat: 9am - 6pm, Sun: Closed"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shareId">Shop Share ID</Label>
                      <div className="flex flex-col gap-1">
                        <Input
                          id="shareId"
                          value={storeFormData.shareId}
                          onChange={(e) => {
                            // Only allow alphanumeric characters, hyphens, and underscores
                            const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '');
                            setStoreFormData({ ...storeFormData, shareId: value });
                          }}
                          placeholder="my-store"
                        />
                        <p className="text-xs text-gray-500">
                          This ID will be used in your shop's public URL: /shop/<span className="font-medium">{storeFormData.shareId || "your-id"}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Only letters, numbers, hyphens, and underscores are allowed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleStoreSettingsSave}
                  className="bg-inventory-primary hover:bg-inventory-primary/90"
                >
                  Save Store Settings
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCategory">Default Category</Label>
                  <Input
                    id="defaultCategory"
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSaveSettings}
              className="bg-inventory-primary hover:bg-inventory-primary/90"
            >
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">
                      Get notifications when items are below minimum stock level
                    </p>
                  </div>
                  <Switch
                    checked={lowStockAlerts}
                    onCheckedChange={setLowStockAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">
                      Receive inventory alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {emailNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Notification Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSaveSettings}
              className="bg-inventory-primary hover:bg-inventory-primary/90"
            >
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StoreSettings } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

interface StoreContextType {
  storeSettings: StoreSettings | null;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  uploadStoreLogo: (file: File) => Promise<string>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        // If user is not authenticated, use default store name
        if (!user) {
          setStoreSettings({
            id: 'demo',
            storeName: 'SmartStock',
            location: 'Demo Location',
            phoneNumber: '+234 123 456 7890',
            businessHours: 'Mon-Sat: 9am - 6pm, Sun: Closed',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          setLoading(false);
          return;
        }

        // Fetch store settings for the current user
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          throw error;
        }

        if (data) {
          const formattedSettings: StoreSettings = {
            id: data.id,
            storeName: data.store_name,
            location: data.location || undefined,
            phoneNumber: data.phone_number || undefined,
            logoUrl: data.logo_url || undefined,
            businessHours: data.business_hours || undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          };
          setStoreSettings(formattedSettings);
        } else {
          // If no settings exist for this user, create default settings
          const { data: newData, error: insertError } = await supabase
            .from('store_settings')
            .insert([{
              user_id: user.id,
              store_name: 'SmartStock',
              location: '123 Main Street, City',
              phone_number: '+234 123 456 7890',
              business_hours: 'Mon-Sat: 9am - 6pm, Sun: Closed'
            }])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          if (newData) {
            const formattedSettings: StoreSettings = {
              id: newData.id,
              storeName: newData.store_name,
              location: newData.location || undefined,
              phoneNumber: newData.phone_number || undefined,
              logoUrl: newData.logo_url || undefined,
              businessHours: newData.business_hours || undefined,
              createdAt: new Date(newData.created_at),
              updatedAt: new Date(newData.updated_at)
            };
            setStoreSettings(formattedSettings);
          }
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
        toast.error('Failed to load store settings');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, [user]);

  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    if (!storeSettings || !user) return;

    // Don't try to update demo settings
    if (storeSettings.id === 'demo') {
      toast.error("Cannot update demo settings. Please log in to update your store settings.");
      return;
    }

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: settings.storeName !== undefined ? settings.storeName : storeSettings.storeName,
          location: settings.location,
          phone_number: settings.phoneNumber,
          logo_url: settings.logoUrl,
          business_hours: settings.businessHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeSettings.id)
        .eq('user_id', user.id); // Ensure we only update the current user's settings

      if (error) {
        throw error;
      }

      setStoreSettings({
        ...storeSettings,
        ...settings,
        updatedAt: new Date()
      });
      toast.success("Store settings updated successfully");
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast.error('Failed to update store settings');
    }
  };

  const uploadStoreLogo = async (file: File): Promise<string> => {
    // Create a unique toast ID
    const toastId = `upload-logo-${uuidv4()}`;

    // Check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to upload a logo", { id: toastId });
      throw new Error("Authentication required");
    }

    try {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit. Please upload a smaller image.');
      }

      // Create a unique file name with user ID to ensure isolation
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/store-logo-${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Show upload toast with ID
      toast.loading('Uploading logo...', { id: toastId });

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Dismiss the loading toast and show success
      toast.success('Logo uploaded successfully', { id: toastId });
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);

      // Dismiss the loading toast and show error
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`, { id: toastId });
      } else {
        toast.error('Failed to upload logo', { id: toastId });
      }

      throw error;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        storeSettings,
        updateStoreSettings,
        uploadStoreLogo,
        loading
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

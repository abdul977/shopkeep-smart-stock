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
  getStoreByShareId: (shareId: string) => Promise<StoreSettings | null>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Define getStoreByShareId function first to avoid circular dependency
  const getStoreByShareId = async (shareId: string): Promise<StoreSettings | null> => {
    try {
      console.log('Getting store by shareId:', shareId);

      // Handle demo store
      if (shareId === 'demo') {
        console.log('Returning demo store settings');
        return {
          id: 'demo',
          storeName: 'SmartStock',
          location: 'Demo Location',
          phoneNumber: '+234 123 456 7890',
          businessHours: 'Mon-Sat: 9am - 6pm, Sun: Closed',
          shareId: 'demo',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Special case for direct user ID access
      const directUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';
      if (shareId === directUserId) {
        console.log('Fetching store settings for direct user ID access:', directUserId);

        // Fetch store settings by user_id instead of share_id
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('user_id', directUserId)
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No store found with this user_id
            console.error('No store found for user ID:', directUserId);
            return null;
          }
          throw error;
        }

        if (data) {
          console.log('Found store settings for user ID:', data);
          return {
            id: data.id,
            storeName: data.store_name,
            location: data.location || undefined,
            phoneNumber: data.phone_number || undefined,
            logoUrl: data.logo_url || undefined,
            businessHours: data.business_hours || undefined,
            shareId: data.share_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          };
        }
      }

      // Regular case: Fetch store settings by share_id
      console.log('Fetching store settings by share_id:', shareId);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('share_id', shareId)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No store found with this share_id
          console.error('No store found with share_id:', shareId);
          return null;
        }
        throw error;
      }

      if (data) {
        console.log('Found store settings by share_id:', data);
        return {
          id: data.id,
          storeName: data.store_name,
          location: data.location || undefined,
          phoneNumber: data.phone_number || undefined,
          logoUrl: data.logo_url || undefined,
          businessHours: data.business_hours || undefined,
          shareId: data.share_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      }

      console.log('No store settings found for shareId:', shareId);
      return null;
    } catch (error) {
      console.error('Error fetching store by share ID:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        // If user is not authenticated, check if we're in the special direct access mode
        if (!user) {
          // Check if we're on the shopkeeper page with the specific user ID
          const pathname = window.location.pathname;
          const directUserId = '5c0d304b-5b84-48a4-a9af-dd0d182cde87';
          const isDirectAccess = pathname.includes(`/shop/${directUserId}`);

          // Check if we're on a shop page with a share ID
          const isShopPage = pathname.startsWith('/shop/');
          const shareIdFromPath = isShopPage ? pathname.split('/shop/')[1] : null;

          console.log('Path analysis:', {
            pathname,
            isDirectAccess,
            isShopPage,
            shareIdFromPath
          });

          // Case 1: Direct user ID access
          if (isDirectAccess) {
            console.log('Direct access mode detected, fetching real store settings');
            // Fetch store settings for the specific user ID
            const { data, error } = await supabase
              .from('store_settings')
              .select('*')
              .eq('user_id', directUserId)
              .limit(1)
              .single();

            if (error && error.code !== 'PGRST116') {
              throw error;
            }

            if (data) {
              console.log('Found store settings for direct access:', data);
              const formattedSettings: StoreSettings = {
                id: data.id,
                storeName: data.store_name,
                location: data.location || undefined,
                phoneNumber: data.phone_number || undefined,
                logoUrl: data.logo_url || undefined,
                businessHours: data.business_hours || undefined,
                shareId: data.share_id || undefined,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
              };
              setStoreSettings(formattedSettings);
              setLoading(false);
              return;
            } else {
              console.error('No store settings found for direct user ID access');
            }
          }

          // Case 2: Shop page with a share ID (not direct access)
          if (isShopPage && shareIdFromPath && shareIdFromPath !== 'demo' && shareIdFromPath !== directUserId) {
            console.log('Shop page with share ID detected:', shareIdFromPath);
            try {
              // Try to load store by share ID
              const store = await getStoreByShareId(shareIdFromPath);
              if (store) {
                console.log('Found store settings for share ID:', store);
                setStoreSettings(store);
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error loading store by share ID:', error);
            }
          }

          // Default demo settings for unauthenticated users
          console.log('Using default demo settings for unauthenticated user');
          setStoreSettings({
            id: 'demo',
            storeName: 'SmartStock',
            location: 'Demo Location',
            phoneNumber: '+234 123 456 7890',
            businessHours: 'Mon-Sat: 9am - 6pm, Sun: Closed',
            shareId: 'demo',
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
            shareId: data.share_id || undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          };
          setStoreSettings(formattedSettings);
        } else {
          // If no settings exist for this user, create default settings
          // Generate a unique share ID for the store
          const shareId = uuidv4();

          const { data: newData, error: insertError } = await supabase
            .from('store_settings')
            .insert([{
              user_id: user.id,
              store_name: 'SmartStock',
              location: '123 Main Street, City',
              phone_number: '+234 123 456 7890',
              business_hours: 'Mon-Sat: 9am - 6pm, Sun: Closed',
              share_id: shareId
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
              shareId: newData.share_id || undefined,
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
      // If shareId is being updated, make sure it's unique and valid
      if (settings.shareId && settings.shareId !== storeSettings.shareId) {
        // Validate share ID format (alphanumeric, hyphens, underscores only)
        const validShareIdPattern = /^[a-zA-Z0-9-_]+$/;
        if (!validShareIdPattern.test(settings.shareId)) {
          throw new Error('Share ID can only contain letters, numbers, hyphens, and underscores.');
        }

        // Check if the shareId is already in use
        try {
          const { data: existingStore, error: checkError } = await supabase
            .from('store_settings')
            .select('id')
            .eq('share_id', settings.shareId)
            .neq('id', storeSettings.id) // Exclude current store
            .limit(1);

          if (checkError) {
            throw checkError;
          }

          if (existingStore && existingStore.length > 0) {
            throw new Error('This share ID is already in use. Please choose a different one.');
          }
        } catch (error) {
          console.error('Error checking share ID:', error);
          throw new Error('Error validating share ID. Please try again.');
        }
      }

      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: settings.storeName !== undefined ? settings.storeName : storeSettings.storeName,
          location: settings.location,
          phone_number: settings.phoneNumber,
          logo_url: settings.logoUrl,
          business_hours: settings.businessHours,
          share_id: settings.shareId,
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update store settings');
      }
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
        getStoreByShareId,
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

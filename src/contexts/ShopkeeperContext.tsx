import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Shopkeeper } from "@/types/inventory";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import * as bcrypt from "bcryptjs";

interface ShopkeeperContextType {
  shopkeepers: Shopkeeper[];
  loading: boolean;
  createShopkeeper: (shopkeeper: Omit<Shopkeeper, "id" | "ownerId" | "createdAt" | "updatedAt"> & { password: string }) => Promise<Shopkeeper | null>;
  updateShopkeeper: (id: string, shopkeeper: Partial<Omit<Shopkeeper, "id" | "ownerId" | "createdAt" | "updatedAt"> & { password?: string }>) => Promise<Shopkeeper | null>;
  deleteShopkeeper: (id: string) => Promise<boolean>;
  getShopkeeper: (id: string) => Shopkeeper | undefined;
}

const ShopkeeperContext = createContext<ShopkeeperContextType | undefined>(undefined);

export const ShopkeeperProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch shopkeepers when the user changes
  useEffect(() => {
    if (user) {
      fetchShopkeepers();
    } else {
      setShopkeepers([]);
      setLoading(false);
    }
  }, [user]);

  // Fetch shopkeepers from the database
  const fetchShopkeepers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('shopkeepers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our Shopkeeper type
      const transformedData: Shopkeeper[] = data.map(item => ({
        id: item.id,
        ownerId: item.owner_id,
        email: item.email,
        name: item.name,
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setShopkeepers(transformedData);
    } catch (error: any) {
      console.error("Error fetching shopkeepers:", error);
      toast.error(`Failed to load shopkeepers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new shopkeeper
  const createShopkeeper = async (shopkeeperData: Omit<Shopkeeper, "id" | "ownerId" | "createdAt" | "updatedAt"> & { password: string }): Promise<Shopkeeper | null> => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a shopkeeper");
        return null;
      }

      console.log("Creating shopkeeper with data:", {
        name: shopkeeperData.name,
        email: shopkeeperData.email,
        active: shopkeeperData.active,
        password: "********" // Don't log the actual password
      });

      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(shopkeeperData.password, salt);

      console.log("Password hashed successfully");

      // Insert the shopkeeper into the database
      const { data, error } = await supabase
        .from('shopkeepers')
        .insert({
          owner_id: user.id,
          email: shopkeeperData.email,
          password: hashedPassword,
          name: shopkeeperData.name,
          active: shopkeeperData.active
        })
        .select()
        .single();

      if (error) {
        console.error("Database error creating shopkeeper:", error);
        throw error;
      }

      console.log("Shopkeeper created in database:", data.id);

      // Transform the data to match our Shopkeeper type
      const newShopkeeper: Shopkeeper = {
        id: data.id,
        ownerId: data.owner_id,
        email: data.email,
        name: data.name,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Update the local state
      setShopkeepers(prev => [newShopkeeper, ...prev]);

      toast.success("Shopkeeper created successfully");
      return newShopkeeper;
    } catch (error: any) {
      console.error("Error creating shopkeeper:", error);
      toast.error(`Failed to create shopkeeper: ${error.message}`);
      return null;
    }
  };

  // Update an existing shopkeeper
  const updateShopkeeper = async (id: string, shopkeeperData: Partial<Omit<Shopkeeper, "id" | "ownerId" | "createdAt" | "updatedAt"> & { password?: string }>): Promise<Shopkeeper | null> => {
    try {
      if (!user) {
        toast.error("You must be logged in to update a shopkeeper");
        return null;
      }

      // Prepare the update data
      const updateData: any = {};

      if (shopkeeperData.email) updateData.email = shopkeeperData.email;
      if (shopkeeperData.name) updateData.name = shopkeeperData.name;
      if (typeof shopkeeperData.active !== 'undefined') updateData.active = shopkeeperData.active;

      // If password is provided, hash it
      if (shopkeeperData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(shopkeeperData.password, salt);
      }

      // Update the shopkeeper in the database
      const { data, error } = await supabase
        .from('shopkeepers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform the data to match our Shopkeeper type
      const updatedShopkeeper: Shopkeeper = {
        id: data.id,
        ownerId: data.owner_id,
        email: data.email,
        name: data.name,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Update the local state
      setShopkeepers(prev => prev.map(sk => sk.id === id ? updatedShopkeeper : sk));

      toast.success("Shopkeeper updated successfully");
      return updatedShopkeeper;
    } catch (error: any) {
      console.error("Error updating shopkeeper:", error);
      toast.error(`Failed to update shopkeeper: ${error.message}`);
      return null;
    }
  };

  // Delete a shopkeeper
  const deleteShopkeeper = async (id: string): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("You must be logged in to delete a shopkeeper");
        return false;
      }

      // Delete the shopkeeper from the database
      const { error } = await supabase
        .from('shopkeepers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the local state
      setShopkeepers(prev => prev.filter(sk => sk.id !== id));

      toast.success("Shopkeeper deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting shopkeeper:", error);
      toast.error(`Failed to delete shopkeeper: ${error.message}`);
      return false;
    }
  };

  // Get a shopkeeper by ID
  const getShopkeeper = (id: string): Shopkeeper | undefined => {
    return shopkeepers.find(sk => sk.id === id);
  };

  return (
    <ShopkeeperContext.Provider
      value={{
        shopkeepers,
        loading,
        createShopkeeper,
        updateShopkeeper,
        deleteShopkeeper,
        getShopkeeper
      }}
    >
      {children}
    </ShopkeeperContext.Provider>
  );
};

export const useShopkeeper = () => {
  const context = useContext(ShopkeeperContext);
  if (context === undefined) {
    throw new Error("useShopkeeper must be used within a ShopkeeperProvider");
  }
  return context;
};

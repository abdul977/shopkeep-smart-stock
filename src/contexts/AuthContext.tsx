import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import * as bcrypt from "bcryptjs";

// Define a type for shopkeeper user
export interface ShopkeeperUser {
  id: string;
  email: string;
  name: string;
  ownerId: string;
  active: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  shopkeeperUser: ShopkeeperUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInShopkeeper: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isShopkeeper: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [shopkeeperUser, setShopkeeperUser] = useState<ShopkeeperUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShopkeeper, setIsShopkeeper] = useState(false);

  // Check for shopkeeper in localStorage on initial load
  useEffect(() => {
    const storedShopkeeper = localStorage.getItem('shopkeeper');
    if (storedShopkeeper) {
      try {
        const shopkeeper = JSON.parse(storedShopkeeper);
        setShopkeeperUser(shopkeeper);
        setIsShopkeeper(true);
      } catch (error) {
        console.error("Error parsing shopkeeper from localStorage:", error);
        localStorage.removeItem('shopkeeper');
      }
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        console.log("User is authenticated:", session.user.email);
      } else {
        console.log("No authenticated user");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);

      // We don't need to check if the user exists here
      // Supabase will handle this for us and return an appropriate error

      // Attempt to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Disable email confirmation for now
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            email: email,
          }
        }
      });

      if (error) {
        console.error("Signup API error:", error);
        throw error;
      }

      // Check if user was created
      if (data?.user) {
        // Wait a moment for the database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // The database trigger will automatically create a profile
        toast.success("Account created successfully! You can now log in.");
      } else {
        toast.info("Please check your email to confirm your account.");
      }
    } catch (error: any) {
      console.error("Signup error details:", error);

      // Provide more specific error messages
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please use a different email or try logging in.");
      } else if (error.message.includes("Database error")) {
        toast.error("There was a problem creating your account. Please try again later.");
      } else {
        toast.error(error.message || "An error occurred during sign up");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        toast.success("Signed in successfully!");
        // The profile should already exist from the database trigger
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      toast.error(error.message || "Invalid login credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInShopkeeper = async (email: string, password: string) => {
    try {
      setLoading(true);

      console.log("Attempting to sign in shopkeeper with email:", email);

      // First, just check if the shopkeeper exists by email
      const { data: shopkeepers, error: fetchError } = await supabase
        .from('shopkeepers')
        .select('*')
        .eq('email', email);

      if (fetchError) {
        console.error("Error fetching shopkeeper:", fetchError);
        throw new Error("Error accessing shopkeeper account");
      }

      console.log("Shopkeeper query result:", shopkeepers ? `Found ${shopkeepers.length} records` : "No data returned");

      // Check if we found any shopkeeper with this email
      if (!shopkeepers || shopkeepers.length === 0) {
        throw new Error("Invalid email or password");
      }

      // Get the first shopkeeper with this email
      const shopkeeperData = shopkeepers[0];

      // Check if the shopkeeper is active
      if (!shopkeeperData.active) {
        throw new Error("This account has been deactivated. Please contact the store owner.");
      }

      // Verify the password
      console.log("Verifying password...");
      const isPasswordValid = await bcrypt.compare(password, shopkeeperData.password);

      if (!isPasswordValid) {
        console.log("Password verification failed");
        throw new Error("Invalid email or password");
      }

      console.log("Password verified successfully");

      // Set the shopkeeper user
      const shopkeeper: ShopkeeperUser = {
        id: shopkeeperData.id,
        email: shopkeeperData.email,
        name: shopkeeperData.name,
        ownerId: shopkeeperData.owner_id,
        active: shopkeeperData.active
      };

      setShopkeeperUser(shopkeeper);
      setIsShopkeeper(true);

      // Store shopkeeper info in localStorage for persistence
      localStorage.setItem('shopkeeper', JSON.stringify(shopkeeper));

      console.log("Shopkeeper login successful:", shopkeeper.name);
      toast.success("Signed in as shopkeeper successfully!");
    } catch (error: any) {
      console.error("Shopkeeper login error:", error);
      toast.error(error.message || "Invalid login credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // If it's a shopkeeper, just clear the shopkeeper state
      if (isShopkeeper) {
        setShopkeeperUser(null);
        setIsShopkeeper(false);
        localStorage.removeItem('shopkeeper');
        toast.success("Signed out successfully");
        return;
      }

      // Otherwise, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        shopkeeperUser,
        loading,
        signUp,
        signIn,
        signInShopkeeper,
        signOut,
        resetPassword,
        isShopkeeper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

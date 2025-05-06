import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

        // Check if user has a profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) {
              console.warn("Profile not found, creating one...");
              // Create profile if it doesn't exist
              supabase
                .from('profiles')
                .insert([{ id: session.user.id }])
                .then(({ error }) => {
                  if (error) {
                    console.error("Failed to create profile:", error);
                  } else {
                    console.log("Profile created successfully");
                  }
                });
            } else {
              console.log("Profile found:", data);
            }
          });
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

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user has a profile when they sign in
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error || !data) {
                console.warn("Profile not found on sign in, creating one...");
                // Create profile if it doesn't exist
                supabase
                  .from('profiles')
                  .insert([{ id: session.user.id }])
                  .then(({ error }) => {
                    if (error) {
                      console.error("Failed to create profile on sign in:", error);
                    } else {
                      console.log("Profile created successfully on sign in");
                    }
                  });
              }
            });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
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

      if (error) throw error;

      // Check if user was created
      if (data?.user) {
        // Manually create a profile if needed
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id }])
            .single();

          if (profileError) {
            console.warn("Failed to create profile:", profileError);
          }
        } catch (profileErr) {
          console.warn("Error creating profile:", profileErr);
        }

        toast.success("Account created successfully! You can now log in.");
      } else {
        toast.info("Please check your email to confirm your account.");
      }
    } catch (error: any) {
      console.error("Signup error details:", error);
      toast.error(error.message || "An error occurred during sign up");
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

        // Check if user has a profile, if not create one
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profileData) {
            // Create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ id: data.user.id }]);

            if (insertError) {
              console.warn("Failed to create profile on login:", insertError);
            }
          }
        } catch (profileErr) {
          console.warn("Error checking/creating profile:", profileErr);
        }
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      toast.error(error.message || "Invalid login credentials");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
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
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
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

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { PageBackground, GlowCircle, GradientButton } from "@/components/ui/global-styles";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // For debugging purposes - check if we can connect to Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count');
        if (error) {
          setDebugInfo(`Connection issue: ${error.message}`);
        } else {
          setDebugInfo(null);
        }
      } catch (err) {
        setDebugInfo(`Connection error: ${err.message}`);
      }
    };

    checkConnection();
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      setSignupError(null);

      // For debugging - log the email being used
      console.log("Attempting signup with email:", data.email);

      // Add a small delay before signup to ensure any previous operations have completed
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        await signUp(data.email, data.password);
        setSignupSuccess(true);

        // Show a success message and redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Give time for the toast to be seen
      } catch (error) {
        console.error("Signup error details:", error);

        // Set a more specific error message
        if (error.message.includes("already registered")) {
          setSignupError("This email is already registered. Please use a different email or try logging in.");
        } else if (error.message.includes("Database error")) {
          setSignupError("There was a problem creating your account. Please try again later.");
        } else {
          setSignupError(`Signup failed: ${error.message}`);
        }

        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error("Outer signup error handler:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageBackground darkMode className="flex items-center justify-center min-h-screen px-4 py-8">
      {/* Background effects */}
      <GlowCircle className="w-[300px] h-[300px] bg-blue-600/20 top-0 right-0" />
      <GlowCircle className="w-[200px] h-[200px] bg-blue-800/20 bottom-20 left-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-6 rounded-xl border border-blue-700/30 backdrop-blur-sm shadow-xl">
          <div className="space-y-1 mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Create an account</h1>
            <p className="text-center text-sm sm:text-base text-blue-300/70">
              Enter your details to create your account
            </p>
          </div>

          {signupError && (
            <div className="mb-4 bg-red-900/30 text-red-300 border border-red-700/30 rounded-md p-3 text-xs sm:text-sm">
              {signupError}
            </div>
          )}

          {signupSuccess && (
            <div className="mb-4 bg-green-900/30 text-green-300 border border-green-700/30 rounded-md p-3 text-xs sm:text-sm">
              Account created successfully! Redirecting to login page...
            </div>
          )}

          {debugInfo && (
            <div className="mb-4 bg-yellow-900/30 text-yellow-300 border border-yellow-700/30 rounded-md p-3 text-xs sm:text-sm">
              Debug: {debugInfo}
            </div>
          )}

          {!signupSuccess && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-blue-200">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          className="text-sm sm:text-base h-9 sm:h-10 bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm text-red-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-blue-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="text-sm sm:text-base h-9 sm:h-10 bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm text-red-300" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base text-blue-200">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="text-sm sm:text-base h-9 sm:h-10 bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm text-red-300" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-9 sm:h-10 text-sm sm:text-base mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="mt-4 text-xs sm:text-sm text-center">
                  <p className="text-blue-200">Try creating: <strong>test@example.com / password123</strong></p>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-6 flex justify-center">
            <div className="text-xs sm:text-sm text-blue-300/70">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-300 hover:text-blue-200 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Signup;

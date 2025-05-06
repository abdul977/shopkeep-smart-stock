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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {signupError && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200 text-xs sm:text-sm">
              <AlertDescription>{signupError}</AlertDescription>
            </Alert>
          )}

          {signupSuccess && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 text-xs sm:text-sm">
              <AlertDescription>
                Account created successfully! Redirecting to login page...
              </AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200 text-xs sm:text-sm">
              <AlertDescription>Debug: {debugInfo}</AlertDescription>
            </Alert>
          )}

          {!signupSuccess && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          className="text-sm sm:text-base h-9 sm:h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="text-sm sm:text-base h-9 sm:h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="text-sm sm:text-base h-9 sm:h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-9 sm:h-10 text-sm sm:text-base mt-2"
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

                <div className="mt-2 text-xs sm:text-sm text-center">
                  <p>Try creating: <strong>test@example.com / password123</strong></p>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center px-4 sm:px-6 pb-6">
          <div className="text-xs sm:text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;

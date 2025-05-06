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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      // For debugging - log the email being used
      console.log("Attempting login with email:", data.email);

      await signIn(data.email, data.password);
      // Navigate to home page after successful login
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      // Set a more specific error message
      if (error.message.includes("Invalid login")) {
        setLoginError("Invalid email or password. Please try again.");
      } else {
        setLoginError(`Login failed: ${error.message}`);
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loginError && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200 text-xs sm:text-sm">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200 text-xs sm:text-sm">
              <AlertDescription>Debug: {debugInfo}</AlertDescription>
            </Alert>
          )}

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
              <Button
                type="submit"
                className="w-full h-9 sm:h-10 text-sm sm:text-base mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-xs sm:text-sm text-center">
            <p>Test account: <strong>test@example.com / password123</strong></p>
            <p className="text-xs text-gray-500 mt-1">(Create this account first using the signup page)</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 pb-6">
          <div className="text-xs sm:text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-xs sm:text-sm text-center text-gray-500">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;

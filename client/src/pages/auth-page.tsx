import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ChefHat, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      // Update the cache immediately and invalidate to trigger refetch
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      // Navigate to home page using wouter with small delay to ensure state update
      setTimeout(() => {
        setLocation('/');
      }, 200);
    },
    onError: (error: any) => {
      const message = error.message || "Invalid email or password";
      toast({
        title: "Login failed",
        description: message.includes("verify your email") 
          ? "Please verify your email before logging in. Check your inbox for verification instructions."
          : message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest("POST", "/api/register", registerData);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.requiresVerification) {
        toast({
          title: "Account Created!",
          description: "Check browser console for verification link (development mode).",
        });
        
        // In development mode, log the verification URL to console
        if (result.developmentMode) {
          console.log("🔗 Click to verify email:", window.location.origin + result.developmentMode.verificationUrl);
          console.log("🔑 Verification token:", result.developmentMode.verificationToken);
        }
        
        setActiveTab("login"); // Switch to login tab
        registerForm.reset(); // Clear the form
      } else {
        // Legacy path if verification is not required
        queryClient.setQueryData(["/api/user"], result);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "Welcome to FlavorBot!",
          description: "Your account has been created successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  // Redirect if already authenticated
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FlavorBot</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Your AI-Powered
              <span className="text-gradient bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent"> Culinary Assistant</span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0">
              Discover personalized recipes, get cooking assistance, and manage your culinary journey with intelligent AI recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-red-500">10,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI-Generated Recipes</div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-yellow-500">Smart</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Personalization</div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-500">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Culinary Support</div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
              <CardDescription>
                Create an account or sign in to access your personalized recipe collection
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">or</span>
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-400"
                      onClick={() => window.location.href = '/api/auth/replit'}
                    >
                      Continue with Replit
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          {...registerForm.register("firstName")}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          {...registerForm.register("lastName")}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="john@example.com"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="At least 8 characters"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">or</span>
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-400"
                      onClick={() => window.location.href = '/api/auth/replit'}
                    >
                      Continue with Replit
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
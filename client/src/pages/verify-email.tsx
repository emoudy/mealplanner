import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check URL parameters for email and token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    const tokenParam = urlParams.get("token");
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
    
    // Auto-verify if both parameters are present
    if (emailParam && tokenParam) {
      handleVerification(emailParam, tokenParam);
    }
  }, []);

  const handleVerification = async (emailValue = email, tokenValue = token) => {
    if (!emailValue || !tokenValue) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and verification token.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await apiRequest("POST", "/api/verify-email", {
        email: emailValue,
        token: tokenValue,
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Verification failed");
      }
      setIsVerified(true);
      toast({
        title: "Email Verified!",
        description: "Your email has been verified successfully. You can now log in.",
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        setLocation("/auth");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification token.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isVerified ? "Email Verified!" : "Verify Your Email"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isVerified ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 dark:text-green-400">
                Your email has been successfully verified!
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Redirecting you to the login page...
              </p>
              <Button 
                onClick={() => setLocation("/auth")}
                className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Enter your email and verification token to activate your account.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Verification Token</Label>
                <Input
                  id="token"
                  placeholder="Enter verification token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>

              <Button 
                onClick={() => handleVerification()}
                disabled={isVerifying || !email || !token}
                className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/auth")}
                  className="text-sm"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
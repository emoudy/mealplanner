import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { SkipNavigation } from "@/components/ui/skip-navigation";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { useAuth } from "@/hooks/useAuth";
import { AddRecipeProvider } from "@/contexts/AddRecipeContext";
import { GlobalAddRecipeModal } from "@/components/GlobalAddRecipeModal";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Recipes from "@/pages/Recipes";
import Chatbot from "@/pages/Chatbot";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page-new";
import VerifyEmailPage from "@/pages/verify-email";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Don't render anything while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <EmailVerificationBanner />}
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        {isAuthenticated ? (
          <>
            <Route path="/" component={Home} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/chatbot" component={Chatbot} />
            <Route path="/settings" component={Settings} />
          </>
        ) : (
          <Route path="/" component={Landing} />
        )}
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddRecipeProvider>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <SkipNavigation />
              <Navigation />
              <main id="main-content" role="main" aria-label="Main content">
                <Router />
              </main>
              <GlobalAddRecipeModal />
              <Toaster aria-live="polite" aria-atomic="true" />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </AddRecipeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {isAuthenticated && <EmailVerificationBanner />}
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/chatbot" component={Chatbot} />
            <Route path="/settings" component={Settings} />
          </>
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
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
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

import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from '@/components/Navigation';
import AccessibilityAnnouncement from '@/components/AccessibilityAnnouncement';

// Pages
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Recipes from '@/pages/Recipes';
import Chatbot from '@/pages/Chatbot';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/not-found';

// Create query client with shared package compatibility
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;
        const response = await fetch(url, { 
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="flavorbot-theme">
        <div className="min-h-screen bg-background font-sans antialiased">
          <AccessibilityAnnouncement />
          <Router>
            <Navigation />
            <main id="main-content" tabIndex={-1} className="outline-none">
              <Switch>
                <Route path="/" component={Landing} />
                <Route path="/home" component={Home} />
                <Route path="/recipes" component={Recipes} />
                <Route path="/chatbot" component={Chatbot} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </Router>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
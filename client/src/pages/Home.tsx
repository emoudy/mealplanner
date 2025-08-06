import { useAuth } from '@/hooks/useAuth';
import { useAddRecipe } from '@/contexts/AddRecipeContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useLocation } from 'wouter';
import { 
  ChefHat, 
  BookOpen, 
  MessageCircle, 
  UtensilsCrossed,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { Recipe } from '@shared/schema';
import { LoadingAnnouncer } from '@/components/ui/loading-announcer';

export default function Home() {
  const { user } = useAuth();
  const { openAddRecipeModal } = useAddRecipe();
  const [, navigate] = useLocation();

  // Fetch user's recipes to get the total count
  const { data: recipes = [], isLoading: recipesLoading, error: recipesError } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    enabled: !!user
  });

  // Fetch usage stats for AI queries
  const { data: usageStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/usage/stats'],
    enabled: !!user
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Announcements for Screen Readers */}
      <LoadingAnnouncer 
        isLoading={recipesLoading} 
        loadingMessage="Loading your recipes..."
        successMessage="Recipes loaded successfully"
        error={recipesError}
      />
      <LoadingAnnouncer 
        isLoading={statsLoading} 
        loadingMessage="Loading usage statistics..."
        successMessage="Statistics loaded"
        error={statsError}
      />
      {/* Welcome Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {(user as any)?.name || 'Chef'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ready to discover some delicious new recipes today?
        </p>
      </header>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading" className="mb-8">
        <h2 id="quick-actions-heading" className="sr-only">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow focus:ring-2 focus:ring-brand-500 focus:outline-none"
            onClick={() => navigate('/chatbot')}
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/chatbot');
              }
            }}
            aria-label="Ask FlavorBot - Get AI-powered recipe recommendations"
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ask FlavorBot
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get AI-powered recipe recommendations
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow focus:ring-2 focus:ring-brand-500 focus:outline-none"
            onClick={() => navigate('/recipes')}
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/recipes');
              }
            }}
            aria-label="My Recipes - View and manage your saved recipes"
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                My Recipes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View and manage your saved recipes
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow focus:ring-2 focus:ring-brand-500 focus:outline-none"
            onClick={openAddRecipeModal}
            role="button" 
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAddRecipeModal();
              }
            }}
            aria-label="Add Recipe - Manually create a new recipe"
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Add Recipe
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manually create a new recipe
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8" tabIndex={-1}>
        <Card tabIndex={-1}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{recipes.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-3 h-3 inline mr-1" style={{ display: 'inline-block' }} />
              {recipes.length === 0 ? 'Start adding recipes' : 'Recipes saved'}
            </p>
          </CardContent>
        </Card>

        <Card tabIndex={-1}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{(usageStats as any)?.recipeQueries || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 inline mr-1" style={{ display: 'inline-block' }} />
              AI queries used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card tabIndex={-1}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5" />
            <span>Getting Started</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to FlavorBot! Here's how to get the most out of your recipe assistant:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Ask our AI chatbot for recipe ideas based on ingredients you have</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Save recipes you love to access them anytime</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Organize recipes by meal type: breakfast, lunch, dinner, or snacks</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Share your favorite recipes with friends via email or text</span>
              </li>
            </ul>

          </div>
        </CardContent>
      </Card>

    </div>
  );
}
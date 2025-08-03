import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  useRecipes, 
  useDeleteRecipe, 
  useRecipeSearch,
  isUnauthorizedError,
  type Recipe 
} from '@flavorbot/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeCard } from '@/components/RecipeCard';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { Link } from 'wouter';
import { 
  Search, 
  Plus, 
  Coffee, 
  Sandwich, 
  UtensilsCrossed, 
  Cookie,
  ChefHat
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Recipes', icon: ChefHat },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sandwich },
  { id: 'dinner', label: 'Dinner', icon: UtensilsCrossed },
  { id: 'snacks', label: 'Snacks', icon: Cookie },
];

export default function Recipes() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const { 
    recipes, 
    isLoading, 
    error,
    filteredCount,
    totalRecipes 
  } = useRecipeSearch(searchQuery, selectedCategory);

  const deleteRecipeMutation = useDeleteRecipe({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    },
  });

  const handleEditRecipe = (recipe: Recipe) => {
    // TODO: Implement recipe editing
    toast({
      title: "Coming Soon",
      description: "Recipe editing will be available soon!",
    });
  };

  const handleDeleteRecipe = (recipeId: number) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipeMutation.mutate(recipeId);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-b-lg border">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Recipes</h1>
          <p className="text-gray-600 dark:text-gray-300">Organize and manage your saved recipes</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
            <Input
              id="recipe-search"
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64"
              aria-describedby="search-description"
            />
            <div id="search-description" className="sr-only">
              Search through your recipes by title, description, or ingredients
            </div>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600"
            aria-label="Add new recipe to your collection"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Recipe
          </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <section aria-labelledby="categories-heading" className="mb-8">
        <h2 id="categories-heading" className="sr-only">Filter recipes by category</h2>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl" role="tablist" aria-label="Recipe categories">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex items-center space-x-2"
                  role="tab"
                  aria-selected={selectedCategory === category.id}
                  aria-controls={`recipes-panel-${category.id}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </section>

      {/* Recipe Grid */}
      <section 
        role="tabpanel" 
        id={`recipes-panel-${selectedCategory}`}
        aria-labelledby="recipes-heading"
      >
        <h2 id="recipes-heading" className="sr-only">
          {selectedCategory === 'all' ? 'All recipes' : `${categories.find(c => c.id === selectedCategory)?.label} recipes`}
          {searchQuery && ` matching "${searchQuery}"`}
        </h2>
        
        {recipes.length > 0 ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="grid"
            aria-label={`Recipe collection showing ${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`}
          >
            {recipes.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleEditRecipe}
                onDelete={handleDeleteRecipe}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <ChefHat className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No recipes found' : 'No recipes yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or browsing different categories'
                : 'Start by asking our AI assistant for recipe recommendations or add your own'
              }
            </p>
            <Link href="/chatbot">
              <Button 
                className="bg-brand-500 hover:bg-brand-600"
                aria-label="Go to FlavorBot AI assistant to get recipe recommendations"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Ask FlavorBot
              </Button>
            </Link>
          </div>
        )}
      </section>

      <AddRecipeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}

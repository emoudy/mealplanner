import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Clock, Users, BookOpen, MessageCircle, UtensilsCrossed } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAddRecipe } from '@/contexts/AddRecipeContext';
import { Link } from 'wouter';
import type { Recipe, MealPlanEntry, MealPlanResponse } from '@flavorbot/shared';

export default function CalendarPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openAddRecipeModal } = useAddRecipe();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Calculate date ranges based on view mode
  const getDateRange = () => {
    if (viewMode === 'month') {
      return {
        start: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
        end: format(endOfMonth(currentDate), 'yyyy-MM-dd')
      };
    } else {
      return {
        start: format(startOfWeek(currentDate), 'yyyy-MM-dd'),
        end: format(endOfWeek(currentDate), 'yyyy-MM-dd')
      };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Fetch user's recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  // Fetch meal plan for the current date range
  const { data: mealPlan = {}, isLoading } = useQuery<MealPlanResponse>({
    queryKey: ['/api/meal-plan', startDate, endDate],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/meal-plan?startDate=${startDate}&endDate=${endDate}`);
      return response.json();
    },
  });

  // Add recipe to meal plan mutation
  const addRecipeMutation = useMutation({
    mutationFn: async ({ date, recipeId, recipeTitle }: { date: string; recipeId: number; recipeTitle: string }) => {
      const response = await apiRequest('POST', '/api/meal-plan', { date, recipeId, recipeTitle });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan'] });
      toast({
        title: "Recipe added",
        description: "Recipe added to your meal plan successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add recipe to meal plan",
        variant: "destructive",
      });
    },
  });

  // Remove recipe from meal plan mutation
  const removeRecipeMutation = useMutation({
    mutationFn: async (entryId: number) => {
      await apiRequest('DELETE', `/api/meal-plan/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plan'] });
      toast({
        title: "Recipe removed",
        description: "Recipe removed from your meal plan successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove recipe from meal plan",
        variant: "destructive",
      });
    },
  });

  // Navigation handlers
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  // Get days to display based on view mode
  const getDaysToDisplay = () => {
    if (viewMode === 'month') {
      return eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      });
    } else {
      return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate)
      });
    }
  };

  const daysToDisplay = getDaysToDisplay();

  // Handle adding recipe to a specific date
  const handleAddRecipe = (date: string, recipe: Recipe) => {
    const dateEntries = mealPlan[date] || [];
    if (dateEntries.length >= 10) {
      toast({
        title: "Limit reached",
        description: "You can only add up to 10 recipes per day",
        variant: "destructive",
      });
      return;
    }

    addRecipeMutation.mutate({
      date,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    });
  };

  // Handle removing recipe from meal plan
  const handleRemoveRecipe = (entryId: number) => {
    removeRecipeMutation.mutate(entryId);
  };

  // Handle recipe click to view details
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400">Plan your meals and organize your recipes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
            <TabsList>
              <TabsTrigger value="month">Monthly</TabsTrigger>
              <TabsTrigger value="week">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={navigatePrevious}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {formatDateHeader()}
        </h2>
        
        <Button variant="outline" size="sm" onClick={navigateNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-4 ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} mb-8`}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysToDisplay.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEntries = mealPlan[dateStr] || [];
          const isCurrentDay = isToday(day);

          return (
            <Card 
              key={dateStr} 
              className={`min-h-32 ${isCurrentDay ? 'ring-2 ring-brand-500' : ''} ${dayEntries.length > 0 ? 'bg-green-50 dark:bg-green-950' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                    {format(day, 'd')}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-6 h-6 p-0"
                        onClick={() => setSelectedDate(dateStr)}
                        disabled={dayEntries.length >= 10}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Recipe for {format(day, 'MMMM d, yyyy')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Action buttons - always visible */}
                        <div className="flex gap-3 justify-center pb-4 border-b">
                          <Link href="/chatbot">
                            <Button 
                              onClick={() => setSelectedDate(null)}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Ask FlavorBot
                            </Button>
                          </Link>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              openAddRecipeModal();
                              setSelectedDate(null);
                            }}
                            className="flex items-center gap-2"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Add a Recipe
                          </Button>
                        </div>

                        {/* Recipe list */}
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {recipes.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500">
                                No recipes found. Use the buttons above to create or find recipes!
                              </p>
                            </div>
                          ) : (
                            recipes.map((recipe) => (
                              <Card 
                                key={recipe.id} 
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => {
                                  handleAddRecipe(dateStr, recipe);
                                  setSelectedDate(null);
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{recipe.title}</h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {recipe.cookTime}m
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {recipe.servings}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {recipe.category}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Plus className="w-4 h-4" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <div 
                      key={entry.id}
                      className="group flex items-center justify-between bg-white dark:bg-gray-800 rounded px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <span 
                        className="truncate flex-1 mr-1"
                        onClick={() => {
                          const recipe = recipes.find(r => r.id === entry.recipeId);
                          if (recipe) handleRecipeClick(recipe);
                        }}
                      >
                        {entry.recipeTitle}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRecipe(entry.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEntries.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {selectedRecipe.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRecipe.description && (
                <p className="text-gray-600 dark:text-gray-400">{selectedRecipe.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.cookTime} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedRecipe.servings} servings
                </span>
                <Badge variant="outline">{selectedRecipe.category}</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
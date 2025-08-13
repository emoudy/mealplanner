import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CalendarIcon, Check, X, Trash2 } from 'lucide-react';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Recipe } from '@flavorbot/shared';

interface IngredientItem {
  name: string;
  recipes: string[];
  checked: boolean;
}

export default function GroceryListPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 6));
  const [groceryList, setGroceryList] = useState<IngredientItem[]>([]);
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);

  // Fetch recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const generateGroceryList = async () => {
    if (!startDate || !endDate) return;

    try {
      // Fetch meal plan data for the selected date range
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      const response = await fetch(`/api/meal-plan?startDate=${startDateStr}&endDate=${endDateStr}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to fetch meal plan:', response.statusText);
        setGroceryList([]);
        return;
      }
      
      const mealPlan: Record<string, any[]> = await response.json();
      
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const selectedRecipes: Recipe[] = [];
      const ingredientMap = new Map<string, string[]>();

      // Collect all recipes from the date range
      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEntries = mealPlan[dateStr] || [];
        
        dayEntries.forEach((entry: any) => {
          const recipe = recipes.find(r => r.id === entry.recipeId);
          if (recipe && !selectedRecipes.find(r => r.id === recipe.id)) {
            selectedRecipes.push(recipe);
          }
        });
      });

      // Process ingredients from selected recipes
      selectedRecipes.forEach(recipe => {
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach((ingredient: string) => {
            const cleanIngredient = ingredient.toLowerCase().trim();
            if (!ingredientMap.has(cleanIngredient)) {
              ingredientMap.set(cleanIngredient, []);
            }
            ingredientMap.get(cleanIngredient)!.push(recipe.title);
          });
        }
      });

      // Convert to grocery list format
      const newGroceryList: IngredientItem[] = Array.from(ingredientMap.entries()).map(([ingredient, recipeNames]) => ({
        name: ingredient,
        recipes: Array.from(new Set(recipeNames)), // Remove duplicates
        checked: false,
      }));

      // Sort alphabetically
      newGroceryList.sort((a, b) => a.name.localeCompare(b.name));
      setGroceryList(newGroceryList);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      setGroceryList([]);
    }
  };

  const toggleIngredient = (index: number) => {
    setGroceryList(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeIngredient = (index: number) => {
    setGroceryList(prev => prev.filter((_, i) => i !== index));
  };

  const clearList = () => {
    setGroceryList([]);
  };

  const clearChecked = () => {
    setGroceryList(prev => prev.filter(item => !item.checked));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Grocery List Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a date range to generate a grocery list from your meal plan
            </p>
          </div>

          {/* Date Range Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover open={showCalendar === 'start'} onOpenChange={(open) => setShowCalendar(open ? 'start' : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setShowCalendar(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover open={showCalendar === 'end'} onOpenChange={(open) => setShowCalendar(open ? 'end' : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setShowCalendar(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  onClick={generateGroceryList}
                  disabled={!startDate || !endDate}
                  className="mt-auto"
                >
                  Generate List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grocery List */}
          {groceryList.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Grocery List ({groceryList.length} items)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearChecked}>
                      Clear Checked
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearList}>
                      Clear All
                    </Button>
                  </div>
                </div>
                {startDate && endDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For meals from {format(startDate, "MMM d")} to {format(endDate, "MMM d, yyyy")}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groceryList.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                          onClick={() => toggleIngredient(index)}
                          aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                        >
                          {item.checked && <Check className="w-4 h-4 text-green-600" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => removeIngredient(index)}
                          aria-label={`Remove ${item.name} from grocery list`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium capitalize",
                          item.checked && "line-through text-gray-500 dark:text-gray-400"
                        )}>
                          {item.name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.recipes.map((recipe, recipeIndex) => (
                            <Badge key={recipeIndex} variant="secondary" className="text-xs">
                              {recipe}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>✓ Checked items: {groceryList.filter(item => item.checked).length}</p>
                  <p>○ Remaining items: {groceryList.filter(item => !item.checked).length}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {groceryList.length === 0 && startDate && endDate && (
            <Card>
              <CardContent className="py-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No recipes are planned for the selected date range. Add some recipes to your meal plan first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
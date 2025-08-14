import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShoppingCart, CalendarIcon, Check, X, Trash2, Plus, Printer, Filter, Save } from 'lucide-react';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import type { Recipe } from '@flavorbot/shared';

interface IngredientItem {
  name: string;
  recipes: { name: string; count: number }[];
  totalQuantity: number;
  originalUnit: string;
  category: string;
  checked: boolean;
  isCustom?: boolean; // Flag to identify user-added custom items
  id?: string; // For custom items to enable persistence
}

// Type for custom grocery items that persist across sessions
interface CustomGroceryItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity?: string;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Component for displaying categorized grocery list
function GroceryListByCategory({ 
  groceryList, 
  toggleIngredient, 
  removeIngredient 
}: {
  groceryList: IngredientItem[];
  toggleIngredient: (index: number) => void;
  removeIngredient: (index: number) => void;
}) {
  const categories = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery / Bread', 'Pantry', 'Baking', 'Spices and Condiments', 'Beverages', 'Household Goods', 'Other'];
  const categorizedItems = categories.reduce((acc, category) => {
    acc[category] = groceryList.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, IngredientItem[]>);

  return (
    <div className="space-y-6 print:contents">
      {categories.map(category => {
        const items = categorizedItems[category];
        if (items.length === 0) return null;

        return (
          <div key={category} className="space-y-3 category-section">
            <h3 
              className={cn(
                "text-lg font-semibold border-b pb-2",
                getCategoryStyles(category)
              )}
              role="heading" 
              aria-level={3}
            >
              {category} ({items.length})
            </h3>
            <div className="space-y-2 print:space-y-1" role="group" aria-labelledby={`${category}-heading`}>
              {items.map((item, itemIndex) => {
                const globalIndex = groceryList.findIndex(globalItem => 
                  globalItem.name === item.name && globalItem.category === item.category
                );
                
                return (
                  <div key={`${category}-${itemIndex}`} className="flex items-start gap-3 p-3 print:p-0 print:gap-2 rounded-lg border print:border-none bg-white dark:bg-gray-800 print:bg-transparent grocery-item">
                    {/* Screen version button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 print:hidden"
                      onClick={() => toggleIngredient(globalIndex)}
                      aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                    >
                      {item.checked && <Check className="w-4 h-4 text-green-600" />}
                    </Button>
                    
                    {/* Print version checkbox */}
                    <div className="hidden print:block checkbox"></div>
                    
                    <div className="flex-1 min-w-0 item-text">
                      <p className={cn(
                        "font-medium capitalize",
                        item.checked && "line-through text-gray-500 dark:text-gray-400"
                      )}>
                        <span className="item-quantity print:font-bold">
                          {item.totalQuantity !== 1 ? `${item.originalUnit} ` : ''}
                        </span>
                        {item.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 recipe-badges print:hidden">
                        {item.recipes.map((recipe, recipeIndex) => (
                          <Badge key={recipeIndex} variant="secondary" className="text-xs">
                            {recipe.name}{recipe.count > 1 ? ` (${recipe.count}×)` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 print:hidden"
                      onClick={() => removeIngredient(globalIndex)}
                      aria-label={`Remove ${item.name} from grocery list`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to get category-specific styles
function getCategoryStyles(category: string): string {
  switch (category) {
    case 'Produce':
      return 'text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    case 'Dairy & Eggs':
      return 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Meat & Seafood':
      return 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'Bakery / Bread':
      return 'text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'Pantry':
      return 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Baking':
      return 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Spices and Condiments':
      return 'text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    case 'Beverages':
      return 'text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    case 'Household Goods':
      return 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    case 'Other':
      return 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    default:
      return 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  }
}

// Helper function to categorize ingredients
function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  // Produce (fresh fruits, vegetables, fresh herbs)
  if (name.includes('lettuce') || name.includes('tomato') || name.includes('onion') || 
      name.includes('garlic') || name.includes('bell pepper') || name.includes('cucumber') ||
      name.includes('carrot') || name.includes('celery') || name.includes('potato') ||
      name.includes('mushroom') || name.includes('spinach') || name.includes('apple') ||
      name.includes('banana') || name.includes('lemon') || name.includes('lime') ||
      name.includes('avocado') || name.includes('broccoli') || name.includes('zucchini') ||
      name.includes('corn') || name.includes('peas') || name.includes('beans') ||
      name.includes('cilantro') || name.includes('parsley') || name.includes('basil') ||
      name.includes('mint') || name.includes('fresh') || name.includes('jalapeño') ||
      name.includes('berries') || name.includes('berry') || name.includes('fruit')) {
    return 'Produce';
  }
  
  // Dairy & Eggs
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') ||
      name.includes('cream') || name.includes('yogurt') || name.includes('egg') ||
      name.includes('sour cream') || name.includes('cottage cheese') || name.includes('ricotta') ||
      name.includes('mozzarella') || name.includes('cheddar') || name.includes('parmesan')) {
    return 'Dairy & Eggs';
  }
  
  // Meat & Seafood
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('turkey') || name.includes('fish') || name.includes('salmon') ||
      name.includes('tuna') || name.includes('shrimp') || name.includes('bacon') ||
      name.includes('ham') || name.includes('ground') || name.includes('steak') ||
      name.includes('anchovy') || name.includes('fillet')) {
    return 'Meat & Seafood';
  }
  
  // Bakery / Bread
  if (name.includes('bread') || name.includes('roll') || name.includes('bagel') ||
      name.includes('bun') || name.includes('tortilla') || name.includes('pita') ||
      name.includes('croissant') || name.includes('muffin') || name.includes('donut')) {
    return 'Bakery / Bread';
  }
  
  // Spices and Condiments (spices, dried herbs, condiments, sauces)
  if (name.includes('cinnamon') || name.includes('nutmeg') || name.includes('ginger') ||
      name.includes('ketchup') || name.includes('mustard') || name.includes('salt') ||
      name.includes('pepper') || name.includes('oregano') || name.includes('thyme') ||
      name.includes('rosemary') || name.includes('paprika') || name.includes('cumin') ||
      name.includes('chili powder') || name.includes('garlic powder') || name.includes('onion powder') ||
      name.includes('spice') || name.includes('seasoning') || name.includes('blend') ||
      name.includes('sauce') || name.includes('vinegar') || name.includes('mayo') ||
      name.includes('mayonnaise') || name.includes('relish') || name.includes('pickle') ||
      name.includes('olives') || name.includes('tahini') || name.includes('glaze') ||
      name.includes('dressing') || name.includes('marinade')) {
    return 'Spices and Condiments';
  }
  
  // Baking (baking-specific ingredients)
  if (name.includes('flour') || name.includes('sugar') || name.includes('brown sugar') ||
      name.includes('powdered sugar') || name.includes('baking powder') || name.includes('baking soda') ||
      name.includes('vanilla') || name.includes('extract') || name.includes('cocoa') ||
      name.includes('chocolate chips') || name.includes('yeast') || name.includes('cornstarch') ||
      name.includes('jell-o') || name.includes('jello') || name.includes('pudding') ||
      name.includes('gelatin') || name.includes('dessert mix') || name.includes('cake mix') ||
      name.includes('frosting') || name.includes('icing')) {
    return 'Baking';
  }
  
  // Beverages (drinks, cooking wines, liquid ingredients)
  if (name.includes('juice') || name.includes('soda') || name.includes('water') ||
      name.includes('wine') || name.includes('beer') || name.includes('coffee') ||
      name.includes('tea') || name.includes('milk') || name.includes('smoothie') ||
      name.includes('energy drink') || name.includes('sports drink') || name.includes('kombucha') ||
      name.includes('sparkling') || name.includes('beverage')) {
    return 'Beverages';
  }
  
  // Pantry (canned goods, grains, pasta, oils, snacks, cereals)
  if (name.includes('pasta') || name.includes('rice') || name.includes('quinoa') ||
      name.includes('granola') || name.includes('oats') || name.includes('cereal') ||
      name.includes('crackers') || name.includes('chips') || name.includes('pretzels') ||
      name.includes('nuts') || name.includes('dried fruit') || name.includes('granola bar') ||
      name.includes('energy bar') || name.includes('oil') || name.includes('olive oil') ||
      name.includes('coconut oil') || name.includes('can') || name.includes('jar') ||
      name.includes('bottle') || name.includes('stock') || name.includes('broth') ||
      name.includes('coconut milk') || name.includes('syrup') || name.includes('honey') ||
      name.includes('pancake mix') || name.includes('oatmeal') || name.includes('beans') ||
      name.includes('lentils') || name.includes('chickpeas') || name.includes('canned')) {
    return 'Pantry';
  }
  
  // Household Goods (cleaning supplies, paper products, personal care, kitchenware)
  if (name.includes('detergent') || name.includes('bleach') || name.includes('cleaner') ||
      name.includes('dish soap') || name.includes('trash bag') || name.includes('paper towel') ||
      name.includes('toilet paper') || name.includes('tissue') || name.includes('towel') ||
      name.includes('linen') || name.includes('kitchenware') || name.includes('pot') ||
      name.includes('pan') || name.includes('dish') || name.includes('plate') ||
      name.includes('appliance') || name.includes('tool') || name.includes('lightbulb') ||
      name.includes('battery') || name.includes('toothbrush') || name.includes('toothpaste') ||
      name.includes('deodorant') || name.includes('shampoo') || name.includes('soap') ||
      name.includes('cleaning') || name.includes('household') || name.includes('laundry')) {
    return 'Household Goods';
  }
  
  // Default to Other
  return 'Other';
}

// Helper function to parse ingredient quantities
function parseIngredient(ingredient: string): { quantity: number; name: string; unit: string } {
  const trimmed = ingredient.trim();
  
  // Handle Unicode fractions and regular fractions
  let processedIngredient = trimmed
    .replace(/¼/g, '1/4')
    .replace(/½/g, '1/2')
    .replace(/¾/g, '3/4')
    .replace(/⅛/g, '1/8')
    .replace(/⅜/g, '3/8')
    .replace(/⅝/g, '5/8')
    .replace(/⅞/g, '7/8')
    .replace(/⅓/g, '1/3')
    .replace(/⅔/g, '2/3');
  
  // Try to match patterns like "2 Large Eggs", "1 cup flour", "1/2 teaspoon salt"
  const match = processedIngredient.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/);
  
  if (match) {
    const quantityStr = match[1];
    const nameWithUnit = match[2];
    
    // Convert fractions to decimals
    let quantity: number;
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      quantity = numerator / denominator;
    } else {
      quantity = parseFloat(quantityStr);
    }
    
    return {
      quantity,
      name: nameWithUnit,
      unit: quantityStr
    };
  }
  
  // If no quantity found, assume 1
  return {
    quantity: 1,
    name: trimmed,
    unit: '1'
  };
}

// Helper function to convert decimal back to fraction
function formatQuantity(decimal: number): string {
  if (decimal === Math.floor(decimal)) {
    // Whole number
    return decimal.toString();
  }
  
  // Common fractions
  const fractions = [
    { decimal: 0.125, display: '1/8' },
    { decimal: 0.25, display: '1/4' },
    { decimal: 0.333, display: '1/3' },
    { decimal: 0.375, display: '3/8' },
    { decimal: 0.5, display: '1/2' },
    { decimal: 0.625, display: '5/8' },
    { decimal: 0.667, display: '2/3' },
    { decimal: 0.75, display: '3/4' },
    { decimal: 0.875, display: '7/8' },
  ];
  
  // Check for exact matches first
  for (const frac of fractions) {
    if (Math.abs(decimal - frac.decimal) < 0.001) {
      return frac.display;
    }
  }
  
  // Check for mixed numbers (e.g., 1.5 = 1 1/2)
  const wholePart = Math.floor(decimal);
  const fractionalPart = decimal - wholePart;
  
  if (wholePart > 0) {
    for (const frac of fractions) {
      if (Math.abs(fractionalPart - frac.decimal) < 0.001) {
        return `${wholePart} ${frac.display}`;
      }
    }
  }
  
  // Fall back to decimal with limited precision
  return decimal.toFixed(2).replace(/\.?0+$/, '');
}

export default function GroceryListPage() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 6));
  const [groceryList, setGroceryList] = useState<IngredientItem[]>([]);
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [showCustomItems, setShowCustomItems] = useState<boolean>(true);

  // Fetch recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  // Fetch custom grocery items
  const { data: customItems = [] } = useQuery<CustomGroceryItem[]>({
    queryKey: ['/api/grocery-items'],
  });

  // Saved grocery list queries and mutations
  const { data: savedGroceryList } = useQuery<{ id: string; userId: string; items: any[]; createdAt: Date; updatedAt: Date; } | null>({
    queryKey: ['/api/saved-grocery-list'],
    retry: false,
  });

  const saveGroceryListMutation = useMutation({
    mutationFn: async (items: IngredientItem[]) => {
      const savedItems = items.map(item => ({
        id: `${item.name}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        category: item.category,
        checked: item.checked,
        totalQuantity: item.totalQuantity,
        originalUnit: item.originalUnit,
        recipes: item.recipes,
        isCustom: item.isCustom,
        customId: item.id
      }));
      
      await apiRequest('POST', '/api/saved-grocery-list', { items: savedItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-grocery-list'] });
    },
  });

  const deleteSavedGroceryListMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/saved-grocery-list');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-grocery-list'] });
    },
  });

  const generateGroceryList = async () => {
    if (!startDate || !endDate) {
      // Even if no date range, show custom items
      const customItemsList: IngredientItem[] = customItems.map((item: CustomGroceryItem) => ({
        name: item.name,
        recipes: [{ name: 'Custom Item', count: 1 }],
        totalQuantity: 1,
        originalUnit: item.unit || '1',
        category: item.category,
        checked: false,
        isCustom: true,
        id: item.id
      }));
      setGroceryList(customItemsList.sort((a, b) => a.name.localeCompare(b.name)));
      return;
    }

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
      const recipeInstances: { recipe: Recipe; count: number }[] = [];
      const ingredientMap = new Map<string, Map<string, number>>();

      // Collect all recipe instances from the date range (including duplicates)
      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayEntries = mealPlan[dateStr] || [];
        
        dayEntries.forEach((entry: any) => {
          const recipe = recipes.find(r => r.id === entry.recipeId);
          if (recipe) {
            const existing = recipeInstances.find(r => r.recipe.id === recipe.id);
            if (existing) {
              existing.count++;
            } else {
              recipeInstances.push({ recipe, count: 1 });
            }
          }
        });
      });

      // Initialize selected recipes if empty (all recipes selected by default)
      let currentSelectedRecipeIds = selectedRecipeIds;
      if (selectedRecipeIds.length === 0 && recipeInstances.length > 0) {
        currentSelectedRecipeIds = recipeInstances.map(ri => ri.recipe.id);
        setSelectedRecipeIds(currentSelectedRecipeIds);
      }

      // Filter recipe instances based on selected recipes
      const filteredRecipeInstances = currentSelectedRecipeIds.length > 0 
        ? recipeInstances.filter(ri => currentSelectedRecipeIds.includes(ri.recipe.id))
        : recipeInstances;

      // Process ingredients from filtered recipe instances with counts
      const ingredientQuantityMap = new Map<string, { totalQuantity: number; originalUnit: string; recipes: Map<string, number> }>();
      
      filteredRecipeInstances.forEach(({ recipe, count }) => {
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach((ingredient: string) => {
            const parsed = parseIngredient(ingredient);
            const cleanIngredientName = parsed.name.toLowerCase().trim();
            
            if (!ingredientQuantityMap.has(cleanIngredientName)) {
              ingredientQuantityMap.set(cleanIngredientName, {
                totalQuantity: 0,
                originalUnit: parsed.unit,
                recipes: new Map()
              });
            }
            
            const ingredientData = ingredientQuantityMap.get(cleanIngredientName)!;
            ingredientData.totalQuantity += parsed.quantity * count;
            ingredientData.recipes.set(recipe.title, (ingredientData.recipes.get(recipe.title) || 0) + count);
          });
        }
      });

      // Convert to grocery list format with proper quantity totals
      const newGroceryList: IngredientItem[] = Array.from(ingredientQuantityMap.entries()).map(([ingredientName, data]) => {
        const recipes = Array.from(data.recipes.entries()).map(([recipeName, count]) => ({
          name: recipeName,
          count
        }));
        
        // Format the total quantity properly
        const displayQuantity = formatQuantity(data.totalQuantity);
        
        return {
          name: ingredientName,
          recipes,
          totalQuantity: data.totalQuantity,
          originalUnit: displayQuantity,
          category: categorizeIngredient(ingredientName),
          checked: false,
        };
      });

      // Add custom grocery items to the list (if enabled)
      const customGroceryList: IngredientItem[] = showCustomItems 
        ? customItems.map((item: CustomGroceryItem) => ({
            name: item.name,
            recipes: [{ name: 'Custom Item', count: 1 }],
            totalQuantity: 1,
            originalUnit: item.unit || '1',
            category: item.category,
            checked: false,
            isCustom: true,
            id: item.id
          }))
        : [];

      // Combine recipe ingredients with custom items
      const combinedList = [...newGroceryList, ...customGroceryList];

      // Sort alphabetically
      combinedList.sort((a, b) => a.name.localeCompare(b.name));
      setGroceryList(combinedList);
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

  const removeIngredient = async (index: number) => {
    const item = groceryList[index];
    
    // If it's a custom item, delete from backend
    if (item.isCustom && item.id) {
      try {
        await deleteCustomItemMutation.mutateAsync(item.id);
      } catch (error) {
        console.error('Failed to delete custom item:', error);
      }
    }
    
    setGroceryList(prev => prev.filter((_, i) => i !== index));
  };

  // Remove duplicate query - using customItems from above

  // Initial load of custom items only (no auto-regeneration)
  // Load saved grocery list on initial load
  useEffect(() => {
    if (savedGroceryList && groceryList.length === 0) {
      loadSavedGroceryList();
    }
  }, [savedGroceryList]);

  useEffect(() => {
    if (customItems.length > 0 && groceryList.length === 0 && !savedGroceryList) {
      // Only show custom items on initial load if no grocery list exists and no saved list
      const customItemsList: IngredientItem[] = customItems.map((item: CustomGroceryItem) => ({
        name: item.name,
        recipes: [{ name: 'Custom Item', count: 1 }],
        totalQuantity: 1,
        originalUnit: item.unit || '1',
        category: item.category,
        checked: false,
        isCustom: true,
        id: item.id
      }));
      setGroceryList(customItemsList.sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [customItems, savedGroceryList]);

  // Mutation to create custom grocery item
  const createCustomItemMutation = useMutation({
    mutationFn: async (itemData: { name: string; category: string; quantity?: string; unit?: string }) => {
      const response = await apiRequest('POST', '/api/grocery-items', itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    },
  });

  // Mutation to delete custom grocery item
  const deleteCustomItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest('DELETE', `/api/grocery-items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-items'] });
    },
  });

  const addCustomItem = async () => {
    if (!newItemName.trim()) return;
    
    const category = categorizeIngredient(newItemName.toLowerCase().trim());
    
    try {
      // Create persistent custom item
      const newCustomItem = await createCustomItemMutation.mutateAsync({
        name: newItemName.trim(),
        category,
        quantity: '1',
        unit: 'item'
      });

      // Immediately add to current grocery list
      const newGroceryItem: IngredientItem = {
        name: newCustomItem.name,
        recipes: [{ name: 'Custom Item', count: 1 }],
        totalQuantity: 1,
        originalUnit: newCustomItem.unit || '1',
        category: newCustomItem.category,
        checked: false,
        isCustom: true,
        id: newCustomItem.id
      };

      setGroceryList(prev => {
        const combined = [...prev, newGroceryItem];
        return combined.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setNewItemName('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add custom item:', error);
    }
  };

  const saveGroceryList = async () => {
    if (groceryList.length === 0) return;
    
    try {
      await saveGroceryListMutation.mutateAsync(groceryList);
    } catch (error) {
      console.error('Failed to save grocery list:', error);
    }
  };

  // Auto-load saved grocery list when component mounts and data becomes available
  useEffect(() => {
    if (savedGroceryList?.items && savedGroceryList.items.length > 0 && groceryList.length === 0) {
      // Use setTimeout to ensure the component is fully mounted and state is stable
      const timeoutId = setTimeout(() => {
        loadSavedGroceryList();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [savedGroceryList, groceryList.length]);

  // Auto-save when grocery list changes (debounced)
  useEffect(() => {
    if (groceryList.length > 0) {
      const timeoutId = setTimeout(() => {
        saveGroceryList();
      }, 2000); // Save after 2 seconds of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [groceryList]);

  const loadSavedGroceryList = () => {
    if (savedGroceryList?.items && savedGroceryList.items.length > 0) {
      const loadedItems: IngredientItem[] = savedGroceryList.items.map((item: any) => ({
        name: item.name,
        category: item.category,
        checked: item.checked,
        totalQuantity: item.totalQuantity,
        originalUnit: item.originalUnit,
        recipes: item.recipes || [],
        isCustom: item.isCustom || false,
        id: item.customId
      }));
      
      setGroceryList(loadedItems);
    }
  };

  const deleteAllItems = async () => {
    try {
      // Delete saved grocery list if it exists
      if (savedGroceryList) {
        await deleteSavedGroceryListMutation.mutateAsync();
      }
      
      // Delete all custom items from backend
      const customItems = groceryList.filter(item => item.isCustom && item.id);
      await Promise.all(
        customItems.map(item => 
          deleteCustomItemMutation.mutateAsync(item.id!)
        )
      );
      
      // Clear the local list
      setGroceryList([]);
    } catch (error) {
      console.error('Failed to delete grocery list:', error);
      // Still clear the list locally even if backend fails
      setGroceryList([]);
    }
  };

  const handleAddFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomItem();
  };







  const printGroceryList = () => {
    window.print();
  };

  // Get available recipes from current meal plan
  const getAvailableRecipes = () => {
    if (!startDate || !endDate) return [];
    
    // This will be populated when grocery list is generated
    const recipeMap = new Map<number, { recipe: Recipe; count: number }>();
    
    // Return current recipes from the grocery list
    const uniqueRecipes = groceryList
      .filter(item => !item.isCustom)
      .reduce((acc, item) => {
        item.recipes.forEach(recipeInfo => {
          if (recipeInfo.name !== 'Custom Item') {
            const recipe = recipes.find(r => r.title === recipeInfo.name);
            if (recipe) {
              acc.set(recipe.id, { recipe, count: recipeInfo.count });
            }
          }
        });
        return acc;
      }, recipeMap);

    return Array.from(uniqueRecipes.values());
  };

  const handleRecipeFilterChange = (recipeId: number, checked: boolean) => {
    if (checked) {
      setSelectedRecipeIds(prev => [...prev, recipeId]);
    } else {
      setSelectedRecipeIds(prev => prev.filter(id => id !== recipeId));
    }
  };

  const handleSelectAllRecipes = () => {
    const allRecipeIds = getAvailableRecipes().map(ri => ri.recipe.id);
    setSelectedRecipeIds(allRecipeIds);
  };

  const handleDeselectAllRecipes = () => {
    setSelectedRecipeIds([]);
  };

  // Filter grocery list based on selected recipes and custom items toggle
  const getFilteredGroceryList = () => {
    return groceryList.filter(item => {
      // Always include custom items if toggle is on
      if (item.isCustom) {
        return showCustomItems;
      }
      
      // For recipe items, check if the recipe is selected
      const itemRecipeIds = item.recipes.map(r => {
        const recipe = recipes.find(rec => rec.title === r.name);
        return recipe?.id;
      }).filter((id): id is number => id !== undefined);
      
      // Include item if at least one of its recipes is selected
      return itemRecipeIds.some(recipeId => selectedRecipeIds.includes(recipeId));
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white print:min-h-0">
      <div className="container mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="max-w-4xl mx-auto print:max-w-none">
          <div className="text-center mb-8 print:hidden">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Grocery List Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a date range to generate a grocery list from your meal plan
            </p>
          </div>

          {/* Date Range Selection */}
          <Card className="mb-6 print:hidden">
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

          {/* Filters Section */}
          {groceryList.length > 0 && (
            <Card className="mb-6 print:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Recipe Filter */}
                  <div className="flex-1">
                    <fieldset className="space-y-3">
                      <legend className="sr-only">Recipe Filter Options</legend>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Label className="text-sm font-medium" id="recipe-filter-label">
                          Show Recipes:
                        </Label>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSelectAllRecipes}
                            className="text-xs"
                            aria-describedby="recipe-filter-label"
                            aria-label="Select all recipes to include in grocery list"
                          >
                            Select All
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDeselectAllRecipes}
                            className="text-xs"
                            aria-describedby="recipe-filter-label"
                            aria-label="Clear all recipe selections from grocery list"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div 
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto"
                        role="group"
                        aria-labelledby="recipe-filter-label"
                        aria-describedby="recipe-filter-description"
                      >
                        <p id="recipe-filter-description" className="sr-only">
                          Select which recipes to include in your grocery list. Unselecting a recipe will remove its ingredients from the list.
                        </p>
                        {getAvailableRecipes().map(({ recipe, count }) => (
                          <div key={recipe.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Checkbox
                              id={`recipe-${recipe.id}`}
                              checked={selectedRecipeIds.includes(recipe.id)}
                              onCheckedChange={(checked) => 
                                handleRecipeFilterChange(recipe.id, checked as boolean)
                              }
                              aria-describedby={`recipe-${recipe.id}-description`}
                            />
                            <Label
                              htmlFor={`recipe-${recipe.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {recipe.title} ({count}x)
                            </Label>
                            <span id={`recipe-${recipe.id}-description`} className="sr-only">
                              {selectedRecipeIds.includes(recipe.id) ? 'Selected' : 'Not selected'} - {recipe.title} appears {count} times in your meal plan
                            </span>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  {/* Custom Items Toggle */}
                  <div className="flex items-center space-x-3 lg:border-l lg:pl-6 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Switch
                      id="show-custom-items"
                      checked={showCustomItems}
                      onCheckedChange={setShowCustomItems}
                      aria-describedby="custom-items-description"
                    />
                    <div className="flex flex-col">
                      <Label htmlFor="show-custom-items" className="text-sm font-medium">
                        Show Custom Items
                      </Label>
                      <span id="custom-items-description" className="text-xs text-muted-foreground">
                        Toggle to show/hide items you added manually
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grocery List */}
          {groceryList.length > 0 && (
            <Card className="grocery-list-print">
              <CardHeader className="print:hidden">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Grocery List ({getFilteredGroceryList().length} items)
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-1 print:hidden"
                      aria-label="Add custom item to grocery list"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveGroceryList}
                      disabled={groceryList.length === 0 || saveGroceryListMutation.isPending}
                      className="flex items-center gap-1 print:hidden"
                      aria-label="Save current grocery list for future use"
                    >
                      <Save className="w-4 h-4" />
                      {saveGroceryListMutation.isPending ? 'Saving...' : 'Save List'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={printGroceryList}
                      className="flex items-center gap-1 print:hidden"
                      aria-label="Print grocery list"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={deleteAllItems} 
                      disabled={deleteSavedGroceryListMutation.isPending}
                      className="print:hidden"
                      aria-label="Delete entire grocery list and all saved data"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteSavedGroceryListMutation.isPending ? 'Deleting...' : 'Delete All'}
                    </Button>
                  </div>
                </div>
                {startDate && endDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For meals from {format(startDate, "MMM d")} to {format(endDate, "MMM d, yyyy")}
                  </p>
                )}

                {showAddForm && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <form onSubmit={handleAddFormSubmit} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter item name (e.g., Milk, Bread, Paper towels)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                        aria-label="Custom grocery item name"
                        autoFocus
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={!newItemName.trim()}
                        aria-label="Add item to grocery list"
                      >
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItemName('');
                        }}
                        aria-label="Cancel adding item"
                      >
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}
              </CardHeader>
              
              {/* Print-only header */}
              <div className="hidden print:block">
                <h1>Grocery Shopping List</h1>
                {startDate && endDate && (
                  <div className="date-range">
                    Meal Plan: {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                  </div>
                )}
              </div>

              <CardContent className="print:p-0">
                <div className="space-y-6 print:grocery-categories-grid">
                  <GroceryListByCategory 
                    groceryList={getFilteredGroceryList()} 
                    toggleIngredient={toggleIngredient}
                    removeIngredient={removeIngredient}
                  />
                </div>

                <Separator className="my-4 print:hidden" />
                
                <div className="text-sm text-gray-600 dark:text-gray-400 print:hidden">
                  <p>✓ Checked items: {getFilteredGroceryList().filter(item => item.checked).length}</p>
                  <p>○ Remaining items: {getFilteredGroceryList().filter(item => !item.checked).length}</p>
                </div>

                {/* Print-only summary */}
                <div className="hidden print:block summary">
                  <p>Total items: {getFilteredGroceryList().length}</p>
                  <p>Date generated: {new Date().toLocaleDateString()}</p>
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No recipes are planned for the selected date range. Add some recipes to your meal plan first.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2"
                  aria-label="Add custom item to grocery list"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Item
                </Button>
                
                {showAddForm && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                    <form onSubmit={handleAddFormSubmit} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter item name (e.g., Milk, Bread, Paper towels)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1"
                        aria-label="Custom grocery item name"
                        autoFocus
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={!newItemName.trim()}
                        aria-label="Add item to grocery list"
                      >
                        Add
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowAddForm(false);
                          setNewItemName('');
                        }}
                        aria-label="Cancel adding item"
                      >
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
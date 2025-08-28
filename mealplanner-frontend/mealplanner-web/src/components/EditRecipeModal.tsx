import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// Error handling now inline instead of using authUtils
import { createRecipeSchema, RecipeData } from '@mealplanner/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { z } from 'zod';

const formSchema = createRecipeSchema.extend({
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")),
  instructionsText: z.string().min(1, "Instructions cannot be empty"),
});

interface EditRecipeModalProps {
  recipe: RecipeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecipeModal({ recipe, open, onOpenChange }: EditRecipeModalProps) {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'lunch',
      cookTime: undefined,
      servings: undefined,
      ingredients: [''],
      instructionsText: '',
    },
  });

  // Reset form when recipe changes
  useEffect(() => {
    if (recipe && open) {
      const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [''];
      const recipeInstructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
      
      setIngredients(recipeIngredients.length > 0 ? recipeIngredients : ['']);
      
      // Convert instructions array to numbered text format
      const instructionsText = recipeInstructions.length > 0 
        ? recipeInstructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')
        : '';
      
      form.reset({
        title: recipe.title || '',
        description: recipe.description || '',
        category: recipe.category || 'lunch',
        cookTime: recipe.cookTime || undefined,
        servings: recipe.servings || undefined,
        ingredients: recipeIngredients.length > 0 ? recipeIngredients : [''],
        instructionsText: instructionsText,
      });
    }
  }, [recipe, open, form]);

  const updateRecipeMutation = useMutation({
    mutationFn: async (data: Omit<z.infer<typeof createRecipeSchema>, 'id'>) => {
      if (!recipe) throw new Error('No recipe to update');
      return await apiRequest('PATCH', `/api/recipes/${recipe.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipe updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      onOpenChange(false);
    },
    onError: (error) => {
      if (/^401: .*Unauthorized/.test((error as Error).message)) {
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
        description: "Failed to update recipe",
        variant: "destructive",
      });
    },
  });

  const addIngredient = () => {
    const newIngredients = [...ingredients, ''];
    setIngredients(newIngredients);
    form.setValue('ingredients', newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
      form.setValue('ingredients', newIngredients);
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
    form.setValue('ingredients', newIngredients);
  };



  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert instructionsText back to array and filter out empty ingredients
    const instructions = data.instructionsText
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.replace(/^\d+\.\s*/, ''));
    
    const filteredData = {
      ...data,
      ingredients: ingredients.filter(ingredient => ingredient.trim() !== ''),
      instructions: instructions,
    };
    
    // Remove instructionsText from the final data
    const { instructionsText, ...finalData } = filteredData;
    updateRecipeMutation.mutate(finalData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-recipe-description">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription id="edit-recipe-description">
            Update your recipe details, ingredients, and cooking instructions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipe title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of your recipe" 
                      className="resize-none" 
                      rows={2}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cookTime"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Cook Time (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servings"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="4"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-base font-medium">Ingredients</FormLabel>
              <div className="space-y-2 mt-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Ingredient ${index + 1}`}
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="instructionsText"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Write your cooking instructions, one step per line. For example:
1. Preheat oven to 350°F
2. Mix dry ingredients in a large bowl
3. Add wet ingredients and stir until combined
4. Bake for 25-30 minutes until golden brown`}
                      className="resize-none min-h-[200px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Write each step on a new line. Numbers will be added automatically if not included.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateRecipeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRecipeMutation.isPending}
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                {updateRecipeMutation.isPending ? 'Updating...' : 'Update Recipe'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
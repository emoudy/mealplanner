import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  useCreateRecipe,
  validateRecipeForm,
  isUnauthorizedError,
  type RecipeFormData 
} from '@flavorbot/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipeFormSchema } from '@flavorbot/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';

// Form schema is now imported from shared package

interface AddRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecipeModal({ open, onOpenChange }: AddRecipeModalProps) {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'dinner',
      cookTime: 30,
      servings: 4,
      ingredients: [''],
      instructions: [''],
    },
  });

  const createRecipeMutation = useCreateRecipe({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipe created successfully!",
      });
      onOpenChange(false);
      reset();
      setIngredients(['']);
      setInstructions(['']);
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
        description: "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  const addIngredient = () => {
    const newIngredients = [...ingredients, ''];
    setIngredients(newIngredients);
    setValue('ingredients', newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
      setValue('ingredients', newIngredients);
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
    setValue('ingredients', newIngredients);
  };

  const addInstruction = () => {
    const newInstructions = [...instructions, ''];
    setInstructions(newInstructions);
    setValue('instructions', newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
      setValue('instructions', newInstructions);
    }
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
    setValue('instructions', newInstructions);
  };

  const onSubmit = (data: RecipeFormData) => {
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    const filteredInstructions = instructions.filter(inst => inst.trim() !== '');
    
    if (filteredIngredients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }
    
    if (filteredInstructions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one instruction",
        variant: "destructive",
      });
      return;
    }

    createRecipeMutation.mutate({
      ...data,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
          <DialogDescription id="dialog-description">
            Fill out the form below to create and save your recipe.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter recipe title"
                aria-required="true"
                aria-describedby={errors.title ? "title-error" : "title-help"}
                aria-invalid={!!errors.title}
              />
              <div id="title-help" className="sr-only">Enter a descriptive name for your recipe</div>
              {errors.title && (
                <p id="title-error" className="text-sm text-red-500 mt-1" role="alert">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger id="category" aria-required="true" aria-describedby="category-help">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
              <div id="category-help" className="sr-only">Choose the meal category that best fits this recipe</div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the recipe"
              rows={2}
              aria-describedby="description-help"
            />
            <div id="description-help" className="sr-only">Optional: Add a brief description about this recipe, its origin, or special notes</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cookTime">Cook Time (minutes)</Label>
              <Input
                id="cookTime"
                type="number"
                {...register('cookTime', { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                {...register('servings', { valueAsNumber: true })}
                placeholder="4"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Ingredients *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1"
                  />
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Instructions *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInstruction}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-sm text-muted-foreground mt-3 min-w-[20px]">
                    {index + 1}.
                  </span>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1"
                    rows={2}
                  />
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="mt-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRecipeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {createRecipeMutation.isPending ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
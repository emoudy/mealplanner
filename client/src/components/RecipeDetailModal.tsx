import { Recipe } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Users,
  Coffee,
  Sandwich,
  UtensilsCrossed,
  Cookie
} from 'lucide-react';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons = {
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: UtensilsCrossed,
  snacks: Cookie,
};

const categoryColors = {
  breakfast: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300',
  lunch: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  dinner: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
  snacks: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export function RecipeDetailModal({ recipe, open, onOpenChange }: RecipeDetailModalProps) {
  if (!recipe) return null;

  const CategoryIcon = categoryIcons[recipe.category as keyof typeof categoryIcons] || UtensilsCrossed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0" aria-describedby="recipe-modal-description">
        <div className="flex flex-col h-full">
          {/* Header with image */}
          {recipe.imageUrl && (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          )}
          
          <div className="p-6 flex-1 overflow-hidden">
            <DialogHeader className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Badge className={categoryColors[recipe.category as keyof typeof categoryColors]}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                </Badge>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                  {recipe.cookTime && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {recipe.cookTime} mins
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {recipe.servings} servings
                    </span>
                  )}
                </div>
              </div>
              
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {recipe.title}
              </DialogTitle>
              
              <DialogDescription id="recipe-modal-description" className="text-gray-600 dark:text-gray-300">
                {recipe.description || 'Recipe details and instructions. Use arrow keys, Page Up/Down, or scroll to navigate content. Press Escape to close.'}
              </DialogDescription>
            </DialogHeader>

            <div 
              className="h-[calc(90vh-300px)] pr-4 overflow-auto focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-md" 
              tabIndex={0}
              role="region"
              aria-label="Recipe content - use arrow keys or Page Up/Down to scroll"
              onKeyDown={(e) => {
                const scrollContainer = e.currentTarget;
                const scrollAmount = 40;
                
                switch (e.key) {
                  case 'ArrowDown':
                    e.preventDefault();
                    scrollContainer.scrollTop += scrollAmount;
                    break;
                  case 'ArrowUp':
                    e.preventDefault();
                    scrollContainer.scrollTop -= scrollAmount;
                    break;
                  case 'PageDown':
                    e.preventDefault();
                    scrollContainer.scrollTop += scrollContainer.clientHeight * 0.8;
                    break;
                  case 'PageUp':
                    e.preventDefault();
                    scrollContainer.scrollTop -= scrollContainer.clientHeight * 0.8;
                    break;
                  case 'Home':
                    e.preventDefault();
                    scrollContainer.scrollTop = 0;
                    break;
                  case 'End':
                    e.preventDefault();
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                    break;
                  case ' ':
                    e.preventDefault();
                    if (e.shiftKey) {
                      scrollContainer.scrollTop -= scrollContainer.clientHeight * 0.8;
                    } else {
                      scrollContainer.scrollTop += scrollContainer.clientHeight * 0.8;
                    }
                    break;
                }
              }}
            >
              <div className="space-y-6 p-1">
                {/* Ingredients */}
                {recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700 dark:text-gray-300">{String(ingredient)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Instructions
                    </h3>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-500 text-white text-sm font-medium rounded-full mr-3 flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{String(instruction)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
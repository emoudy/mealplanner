import { Recipe } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Share, 
  Trash2, 
  Clock, 
  Users,
  Coffee,
  Sandwich,
  UtensilsCrossed,
  Cookie
} from 'lucide-react';
import { useState } from 'react';
import { ShareModal } from './ShareModal';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
  onView?: (recipe: Recipe) => void;
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

export function RecipeCard({ recipe, onEdit, onDelete, onView }: RecipeCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const CategoryIcon = categoryIcons[recipe.category as keyof typeof categoryIcons] || UtensilsCrossed;

  const handleCardClick = () => {
    if (onView) {
      onView(recipe);
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer focus:ring-2 focus:ring-brand-500 focus:outline-none"
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`View ${recipe.title} recipe details. Press E to edit, S to share, D to delete`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
          // Allow access to actions via keyboard
          if (e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            onEdit(recipe);
          }
          if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            setShowShareModal(true);
          }
          if (e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            onDelete(recipe.id);
          }
        }}
      >
        {recipe.imageUrl && (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge className={categoryColors[recipe.category as keyof typeof categoryColors]}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                className="h-8 w-8 text-gray-400 hover:text-brand-500"
                aria-label={`Edit ${recipe.title} recipe`}
                tabIndex={-1}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareModal(true);
                }}
                className="h-8 w-8 text-gray-400 hover:text-indigo-500"
                aria-label={`Share ${recipe.title} recipe`}
                tabIndex={-1}
              >
                <Share className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                aria-label={`Delete ${recipe.title} recipe`}
                tabIndex={-1}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {recipe.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
          
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
        </CardContent>
      </Card>

      <ShareModal
        recipe={recipe}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
    </>
  );
}

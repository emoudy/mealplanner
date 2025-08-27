import { AddRecipeModal } from '@/components/AddRecipeModal';
import { useAddRecipe } from '@/contexts/AddRecipeContext';

export function GlobalAddRecipeModal() {
  const { isAddRecipeModalOpen, closeAddRecipeModal } = useAddRecipe();

  return (
    <AddRecipeModal
      open={isAddRecipeModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeAddRecipeModal();
        }
      }}
    />
  );
}
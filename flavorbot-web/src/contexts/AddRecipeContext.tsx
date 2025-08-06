import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AddRecipeContextType {
  isAddRecipeModalOpen: boolean;
  openAddRecipeModal: () => void;
  closeAddRecipeModal: () => void;
}

const AddRecipeContext = createContext<AddRecipeContextType | undefined>(undefined);

export function AddRecipeProvider({ children }: { children: ReactNode }) {
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);

  const openAddRecipeModal = () => setIsAddRecipeModalOpen(true);
  const closeAddRecipeModal = () => setIsAddRecipeModalOpen(false);

  return (
    <AddRecipeContext.Provider
      value={{
        isAddRecipeModalOpen,
        openAddRecipeModal,
        closeAddRecipeModal,
      }}
    >
      {children}
    </AddRecipeContext.Provider>
  );
}

export function useAddRecipe() {
  const context = useContext(AddRecipeContext);
  if (context === undefined) {
    throw new Error('useAddRecipe must be used within an AddRecipeProvider');
  }
  return context;
}
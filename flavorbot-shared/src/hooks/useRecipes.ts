import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRecipeData, UpdateRecipeData, GenerateRecipeData } from "../utils/schemas.js";
import type { RecipeResponse } from "../types/index.js";
import { useApi } from "./useApi.js";

export function useRecipes(page = 1, limit = 10) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get recipes query
  const recipesQuery = useQuery({
    queryKey: ["recipes", { page, limit }],
    queryFn: () => api.recipes.getRecipes(page, limit),
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: (data: CreateRecipeData) => api.recipes.createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });

  // Update recipe mutation
  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecipeData }) =>
      api.recipes.updateRecipe(id, data),
    onSuccess: (updatedRecipe: RecipeResponse) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.setQueryData(["recipes", updatedRecipe.id], updatedRecipe);
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: (id: number) => api.recipes.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: (data: GenerateRecipeData) => api.recipes.generateRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });

  return {
    // State
    recipes: recipesQuery.data?.data || [],
    pagination: recipesQuery.data?.pagination,
    isLoading: recipesQuery.isLoading,
    error: recipesQuery.error,

    // Mutations
    createRecipe: createRecipeMutation.mutate,
    updateRecipe: updateRecipeMutation.mutate,
    deleteRecipe: deleteRecipeMutation.mutate,
    generateRecipe: generateRecipeMutation.mutate,

    // Mutation states
    isCreating: createRecipeMutation.isPending,
    isUpdating: updateRecipeMutation.isPending,
    isDeleting: deleteRecipeMutation.isPending,
    isGenerating: generateRecipeMutation.isPending,

    // Mutation errors
    createError: createRecipeMutation.error,
    updateError: updateRecipeMutation.error,
    deleteError: deleteRecipeMutation.error,
    generateError: generateRecipeMutation.error,

    // Utilities
    refetch: recipesQuery.refetch,
  };
}

// Hook for single recipe
export function useRecipe(id: number) {
  const api = useApi();

  return useQuery({
    queryKey: ["recipes", id],
    queryFn: () => api.recipes.getRecipe(id),
    enabled: !!id,
  });
}
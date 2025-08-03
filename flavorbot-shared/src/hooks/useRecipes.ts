import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { Recipe, RecipeFormData } from '../types/index.js';

// Query key constants
export const RECIPES_QUERY_KEY = '/api/recipes';

// Hook for fetching recipes
export const useRecipes = () => {
  return useQuery<Recipe[]>({
    queryKey: [RECIPES_QUERY_KEY],
    queryFn: () => apiClient.get<Recipe[]>(RECIPES_QUERY_KEY),
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for fetching a single recipe
export const useRecipe = (id: number) => {
  return useQuery<Recipe>({
    queryKey: [RECIPES_QUERY_KEY, id],
    queryFn: () => apiClient.get<Recipe>(`${RECIPES_QUERY_KEY}/${id}`),
    retry: false,
    enabled: !!id,
  });
};

// Hook for creating recipes
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecipeFormData) => 
      apiClient.post<Recipe>(RECIPES_QUERY_KEY, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
    },
  });
};

// Hook for updating recipes
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RecipeFormData> }) =>
      apiClient.put<Recipe>(`${RECIPES_QUERY_KEY}/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY, variables.id] });
    },
  });
};

// Hook for deleting recipes
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => 
      apiClient.delete(`${RECIPES_QUERY_KEY}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
    },
  });
};

// Hook for recipe search and filtering
export const useRecipeSearch = (searchQuery: string, category: string) => {
  const { data: recipes = [], ...rest } = useRecipes();

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    // Filter by category
    const matchesCategory = category === 'all' || recipe.category === category;
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients?.some((ingredient: string) => 
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesCategory && matchesSearch;
  });

  return {
    recipes: filteredRecipes,
    totalRecipes: recipes.length,
    filteredCount: filteredRecipes.length,
    ...rest,
  };
};
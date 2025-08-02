import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, isUnauthorizedError } from '../api/client';
import { Recipe, CreateRecipeData, UpdateRecipeData } from '../types/recipe';

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...recipeKeys.lists(), { filters }] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: number) => [...recipeKeys.details(), id] as const,
};

// Fetch all recipes
export function useRecipes(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: recipeKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      const queryString = params.toString();
      const endpoint = `/api/recipes${queryString ? `?${queryString}` : ''}`;
      
      return apiRequest<Recipe[]>('GET', endpoint);
    },
  });
}

// Fetch single recipe
export function useRecipe(id: number) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => apiRequest<Recipe>('GET', `/api/recipes/${id}`),
    enabled: !!id,
  });
}

// Create recipe mutation
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRecipeData) => 
      apiRequest<Recipe>('POST', '/api/recipes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        // Handle auth error - redirect to login
        throw error;
      }
    },
  });
}

// Update recipe mutation
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecipeData }) =>
      apiRequest<Recipe>('PUT', `/api/recipes/${id}`, data),
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.setQueryData(recipeKeys.detail(updatedRecipe.id), updatedRecipe);
    },
  });
}

// Delete recipe mutation
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/recipes/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
    },
  });
}
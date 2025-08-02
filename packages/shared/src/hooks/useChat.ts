import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { ChatMessageUI, SendMessageData, GenerateRecipeData } from '../types/chat';
import { Recipe } from '../types/recipe';

// Chat API responses
interface ChatResponse {
  message: string;
  sessionId: string;
}

interface RecipeResponse {
  recipe: Recipe;
  message: string;
  sessionId: string;
}

// Custom hook for chat functionality
export function useChat() {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Send regular chat message
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageData) => 
      apiRequest<ChatResponse>('POST', '/api/chat/message', {
        ...data,
        sessionId: sessionId || undefined,
      }),
    onMutate: (data) => {
      // Optimistically add user message
      const userMessage: ChatMessageUI = {
        id: Date.now().toString(),
        role: 'user',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add loading assistant message
      const loadingMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      setMessages(prev => [...prev, loadingMessage]);
    },
    onSuccess: (response) => {
      setSessionId(response.sessionId);
      
      // Replace loading message with actual response
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isLoading
            ? {
                ...msg,
                content: response.message,
                isLoading: false,
              }
            : msg
        )
      );
    },
    onError: (error) => {
      // Update loading message with error
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isLoading
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
                error: error.message,
              }
            : msg
        )
      );
    },
  });

  // Generate recipe with AI
  const generateRecipeMutation = useMutation({
    mutationFn: (data: GenerateRecipeData) => 
      apiRequest<RecipeResponse>('POST', '/api/chat/generate-recipe', {
        ...data,
        sessionId: sessionId || undefined,
      }),
    onMutate: (data) => {
      // Add user message
      const userMessage: ChatMessageUI = {
        id: Date.now().toString(),
        role: 'user',
        content: data.prompt,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add loading assistant message
      const loadingMessage: ChatMessageUI = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Let me create a recipe for you...',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      setMessages(prev => [...prev, loadingMessage]);
    },
    onSuccess: (response) => {
      setSessionId(response.sessionId);
      
      // Replace loading message with recipe response
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isLoading
            ? {
                ...msg,
                content: response.message,
                recipe: response.recipe,
                isLoading: false,
              }
            : msg
        )
      );
      
      // Invalidate recipes cache since we might have a new recipe
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error) => {
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isLoading
            ? {
                ...msg,
                content: 'Sorry, I had trouble generating that recipe. Please try again.',
                isLoading: false,
                error: error.message,
              }
            : msg
        )
      );
    },
  });

  // Helper functions
  const sendMessage = (message: string) => {
    sendMessageMutation.mutate({ message });
  };

  const generateRecipe = (prompt: string, preferences?: GenerateRecipeData['preferences']) => {
    generateRecipeMutation.mutate({ prompt, preferences: preferences || {} });
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  return {
    messages,
    sendMessage,
    generateRecipe,
    clearChat,
    isLoading: sendMessageMutation.isPending || generateRecipeMutation.isPending,
    error: sendMessageMutation.error || generateRecipeMutation.error,
  };
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { ChatMessage, ChatSession } from '../types/index.js';

// Query key constants
export const CHAT_CONVERSATION_KEY = '/api/chatbot/conversation';

// Hook for chatbot conversation
export const useChatbot = () => {
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // Fetch conversation history
  const { 
    data: conversation, 
    isLoading: isLoadingHistory,
    error 
  } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: [CHAT_CONVERSATION_KEY],
    queryFn: () => apiClient.get<{ messages: ChatMessage[] }>(CHAT_CONVERSATION_KEY),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => 
      apiClient.post<{ reply: string }>('/api/chatbot/message', { message }),
    onMutate: async (message: string) => {
      setIsTyping(true);
      
      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: Date.now(),
        userId: 'temp', // Will be set by server
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      queryClient.setQueryData([CHAT_CONVERSATION_KEY], (old: any) => ({
        messages: [...(old?.messages || []), userMessage],
      }));

      return { userMessage };
    },
    onSuccess: (data, message, context) => {
      // Add bot response
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        userId: 'assistant',
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      queryClient.setQueryData([CHAT_CONVERSATION_KEY], (old: any) => ({
        messages: [...(old?.messages || []), botMessage],
      }));
    },
    onError: (error, message, context) => {
      // Remove optimistic user message on error
      queryClient.setQueryData([CHAT_CONVERSATION_KEY], (old: any) => ({
        messages: (old?.messages || []).filter((msg: ChatMessage) => 
          msg.id !== context?.userMessage.id
        ),
      }));
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  // Clear conversation
  const clearConversation = useMutation({
    mutationFn: () => apiClient.delete('/api/chatbot/conversation'),
    onSuccess: () => {
      queryClient.setQueryData([CHAT_CONVERSATION_KEY], { messages: [] });
    },
  });

  const sendMessage = (message: string) => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const clear = () => {
    clearConversation.mutate();
  };

  return {
    messages: conversation?.messages || [],
    isLoading: isLoadingHistory,
    isTyping: isTyping || sendMessageMutation.isPending,
    error,
    sendMessage,
    clear,
    isSending: sendMessageMutation.isPending,
  };
};

// Hook for getting chat suggestions
export const useChatSuggestions = () => {
  return useQuery<string[]>({
    queryKey: ['/api/chatbot/suggestions'],
    queryFn: () => apiClient.get<string[]>('/api/chatbot/suggestions'),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
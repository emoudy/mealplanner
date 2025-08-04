import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
// Error handling now inline instead of using authUtils
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  User, 
  Bookmark,
  Clock,
  Users,
  Loader2,
  Check
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recipe?: any;
}

const quickSuggestions = [
  'Vegetarian pasta',
  'Quick breakfast',
  'Healthy snacks',
  'Italian cuisine',
  'Chicken recipes',
  'Dessert ideas'
];

// Function to extract suggestions from FlavorBot responses
function extractSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  
  // Look for patterns like "• Item name - description" or "- Item name - description"
  // Updated regex to capture the food name before the first dash that follows whitespace
  const listPattern = /^[\s]*[•\-]\s*([^•\n]+?)(?:\s+\-\s+.+)?$/gm;
  let match;
  
  while ((match = listPattern.exec(content)) !== null) {
    let suggestion = match[1].trim();
    
    // Remove markdown formatting (asterisks)
    suggestion = suggestion.replace(/\*\*/g, '');
    
    // Filter out very short items and common words, but allow food items
    if (suggestion.length > 3 && suggestion.length < 60 && 
        !suggestion.toLowerCase().includes('minutes:') && 
        !suggestion.toLowerCase().includes('servings') &&
        !suggestion.toLowerCase().includes('under ') &&
        !suggestion.toLowerCase().includes('5-10 ') &&
        !suggestion.toLowerCase().includes('protein-packed') &&
        !suggestion.toLowerCase().includes('energy-boosting')) {
      suggestions.push(suggestion);
    }
  }
  
  // Also look for bold items like "**Item name**" (recipe titles)
  const boldPattern = /\*\*([^*]+)\*\*/g;
  while ((match = boldPattern.exec(content)) !== null) {
    const suggestion = match[1].trim();
    if (suggestion.length > 3 && suggestion.length < 50 && 
        !suggestion.toLowerCase().includes('quick') && 
        !suggestion.toLowerCase().includes('minutes') &&
        !suggestion.toLowerCase().includes('under') &&
        !suggestion.toLowerCase().includes('hearty') &&
        !suggestion.toLowerCase().includes('protein-packed') &&
        !suggestion.toLowerCase().includes('energy-boosting')) {
      suggestions.push(suggestion);
    }
  }
  
  // Return unique suggestions, limited to 6
  return [...new Set(suggestions)].slice(0, 6);
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load conversation history
  const { data: conversation } = useQuery({
    queryKey: ['/api/chatbot/conversation'],
    retry: false,
  });

  // Load user's saved recipes to check for duplicates
  const { data: userRecipes } = useQuery({
    queryKey: ['/api/recipes'],
    retry: false,
  });

  useEffect(() => {
    if (conversation && conversation.messages && Array.isArray(conversation.messages)) {
      setMessages(conversation.messages);
    } else {
      // Fallback to default welcome message if no history
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm FlavorBot, your AI recipe assistant. I can help you find recipes based on ingredients, dietary preferences, cooking time, or cuisine type. What would you like to cook today?"
      }]);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const newMessages = [...messages, { role: 'user' as const, content: message }];
      setMessages(newMessages);
      
      const response = await apiRequest('POST', '/api/chatbot/chat', {
        messages: newMessages
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Extract dynamic suggestions from FlavorBot's response
      const suggestions = extractSuggestions(data.response);
      setDynamicSuggestions(suggestions);
    },
    onError: (error) => {
      if (/^401: .*Unauthorized/.test((error as Error).message)) {
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
        description: "Failed to get response from FlavorBot",
        variant: "destructive",
      });
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/chatbot/generate-recipe', { prompt });
      return response.json();
    },
    onSuccess: (recipe) => {
      const recipeMessage: Message = {
        role: 'assistant',
        content: `Perfect! Here's a delicious recipe I found for you:`,
        recipe: recipe
      };
      setMessages(prev => [...prev, recipeMessage]);
      setIsGeneratingRecipe(false);
    },
    onError: (error) => {
      setIsGeneratingRecipe(false);
      if (/^401: .*Unauthorized/.test((error as Error).message)) {
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
        description: (error as Error).message || "Failed to generate recipe",
        variant: "destructive",
      });
    },
  });

  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: any) => {
      await apiRequest('POST', '/api/recipes', {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        category: recipe.category,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        isFromAI: true,
      });
    },
    onSuccess: (data, variables) => {
      // Mark this recipe as saved using its title as a unique identifier
      setSavedRecipes(prev => new Set(prev).add(variables.title));
      toast({
        title: "Success",
        description: "Recipe saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
    },
    onError: (error) => {
      if (/^401: .*Unauthorized/.test((error as Error).message)) {
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
        description: "Failed to save recipe",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    // Clear dynamic suggestions when user types their own message
    setDynamicSuggestions([]);

    // Check if this looks like a recipe request
    const recipeKeywords = ['recipe', 'cook', 'make', 'ingredients', 'dish', 'meal'];
    const isRecipeRequest = recipeKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (isRecipeRequest) {
      setIsGeneratingRecipe(true);
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      generateRecipeMutation.mutate(message);
    } else {
      chatMutation.mutate(message);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    // Clear dynamic suggestions when a suggestion is clicked
    setDynamicSuggestions([]);
  };

  const handleSaveRecipe = (recipe: any) => {
    saveRecipeMutation.mutate(recipe);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ask FlavorBot</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Get personalized recipe recommendations from our AI assistant
        </p>
      </div>

      {/* Chat Container */}
      <Card className="overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-lg ${
                message.role === 'user' 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : 'bg-gray-100 dark:bg-gray-700'
              } rounded-lg p-3`}>
                {message.role === 'user' ? (
                  <p className="text-sm text-white">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-sm text-gray-900 dark:text-white prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">{children}</h3>,
                        strong: ({children}) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                        ul: ({children}) => <ul className="list-disc ml-4 space-y-1 mb-3">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal ml-4 space-y-1 mb-3">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700 dark:text-gray-300 mb-1">{children}</li>,
                        p: ({children}) => <p className="mb-2 text-gray-700 dark:text-gray-300">{children}</p>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {/* Recipe Display */}
                {message.recipe && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-brand-600 dark:text-brand-400">
                        {message.recipe.title}
                      </h4>
                      <Badge variant="outline" className="capitalize">
                        {message.recipe.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {message.recipe.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {message.recipe.cookTime} mins
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {message.recipe.servings} servings
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Ingredients:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {message.recipe.ingredients.map((ingredient: string, i: number) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions:</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {message.recipe.instructions.map((instruction: string, i: number) => (
                            <li key={i}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    
                    {(() => {
                      // Check if recipe is already saved in database or in current session
                      const isInDatabase = Array.isArray(userRecipes) ? userRecipes.some((recipe: any) => 
                        recipe.title === message.recipe.title && 
                        recipe.isFromAI === true
                      ) : false;
                      const isInSession = savedRecipes.has(message.recipe.title);
                      const isRecipeSaved = isInDatabase || isInSession;
                      const isPending = saveRecipeMutation.isPending;
                      
                      return (
                        <Button 
                          onClick={() => handleSaveRecipe(message.recipe)}
                          disabled={isPending || isRecipeSaved}
                          className={`w-full mt-4 px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                            isRecipeSaved 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
                        >
                          {isRecipeSaved ? (
                            <>
                              <Check className="w-4 h-4 mr-2" style={{ display: 'inline-block' }} />
                              Recipe Saved!
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4 mr-2" style={{ display: 'inline-block' }} />
                              {isPending ? 'Saving...' : 'Save Recipe'}
                            </>
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading State */}
          {(chatMutation.isPending || isGeneratingRecipe) && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {isGeneratingRecipe ? 'Creating your recipe...' : 'FlavorBot is thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about ingredients, cuisines, dietary restrictions..."
              className="flex-1"
              disabled={chatMutation.isPending || isGeneratingRecipe}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={chatMutation.isPending || isGeneratingRecipe || !inputMessage.trim()}
              className="bg-brand-500 hover:bg-brand-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Dynamic or Quick Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(dynamicSuggestions.length > 0 ? dynamicSuggestions : quickSuggestions).map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSuggestion(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

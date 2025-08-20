import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '@mealplanner/shared';

const quickSuggestions = [
  "What can I make with chicken?",
  "Easy pasta recipe for dinner",
  "Healthy breakfast ideas",
  "Quick snack recipes",
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, sendMessage, generateRecipe, isLoading } = useChat();

  const styles = createStyles(colors);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      // Check if this looks like a recipe request
      const recipeKeywords = ['recipe', 'cook', 'make', 'ingredients', 'dish', 'meal'];
      const isRecipeRequest = recipeKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );

      if (isRecipeRequest) {
        generateRecipe(inputText.trim());
      } else {
        sendMessage(inputText.trim());
      }
      
      setInputText('');
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    generateRecipe(suggestion);
  };

  const renderMessage = ({ item: message }: any) => (
    <View
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {message.role === 'assistant' && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble" size={16} color={colors.brandForeground} />
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {message.isLoading ? (
          <View style={styles.loadingMessage}>
            <ActivityIndicator size="small" color={colors.mutedForeground} />
            <Text style={styles.loadingText}>MealPlanner is thinking...</Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {message.content}
            </Text>
            
            {/* Recipe Card */}
            {message.recipe && (
              <View style={styles.recipeCard}>
                <Text style={styles.recipeTitle}>{message.recipe.title}</Text>
                <Text style={styles.recipeDescription}>{message.recipe.description}</Text>
                
                <View style={styles.recipeDetails}>
                  <View style={styles.recipeDetail}>
                    <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                    <Text style={styles.recipeDetailText}>{message.recipe.cookTime}m</Text>
                  </View>
                  <View style={styles.recipeDetail}>
                    <Ionicons name="people-outline" size={14} color={colors.mutedForeground} />
                    <Text style={styles.recipeDetailText}>{message.recipe.servings} servings</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.saveButton}>
                  <Ionicons name="bookmark-outline" size={16} color={colors.brandForeground} />
                  <Text style={styles.saveButtonText}>Save Recipe</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );

  const renderQuickSuggestion = ({ item: suggestion }: any) => (
    <TouchableOpacity
      style={styles.suggestionChip}
      onPress={() => handleQuickSuggestion(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.botInfo}>
              <View style={styles.botAvatarLarge}>
                <Ionicons name="chatbubble" size={24} color={colors.brandForeground} />
              </View>
              <View>
                <Text style={styles.botName}>MealPlanner</Text>
                <Text style={styles.botStatus}>Your AI Cooking Assistant</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.welcomeContainer}>
                <View style={styles.welcomeContent}>
                  <Ionicons name="restaurant" size={48} color={colors.brand} />
                  <Text style={styles.welcomeTitle}>Welcome to MealPlanner!</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Ask me for recipe recommendations, cooking tips, or ingredient suggestions
                  </Text>
                </View>
                
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                <FlatList
                  data={quickSuggestions}
                  renderItem={renderQuickSuggestion}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestionsContainer}
                />
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask MealPlanner anything..."
              placeholderTextColor={colors.mutedForeground}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.brandForeground} />
              ) : (
                <Ionicons name="send" size={20} color={colors.brandForeground} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    botInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    botAvatarLarge: {
      width: 40,
      height: 40,
      backgroundColor: colors.brand,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
    },
    botStatus: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    messagesContainer: {
      padding: 20,
      paddingBottom: 10,
    },
    welcomeContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    welcomeContent: {
      alignItems: 'center',
      marginBottom: 32,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.foreground,
      marginTop: 16,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    suggestionsContainer: {
      gap: 8,
    },
    suggestionChip: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.secondaryForeground,
    },
    messageContainer: {
      marginBottom: 16,
    },
    userMessage: {
      alignItems: 'flex-end',
    },
    assistantMessage: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 8,
    },
    botAvatar: {
      width: 32,
      height: 32,
      backgroundColor: colors.brand,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    messageBubble: {
      maxWidth: '80%',
      borderRadius: 16,
      padding: 12,
    },
    userBubble: {
      backgroundColor: colors.brand,
    },
    assistantBubble: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userText: {
      color: colors.brandForeground,
    },
    assistantText: {
      color: colors.foreground,
    },
    loadingMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontStyle: 'italic',
    },
    recipeCard: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recipeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.brand,
      marginBottom: 4,
    },
    recipeDescription: {
      fontSize: 14,
      color: colors.foreground,
      marginBottom: 8,
    },
    recipeDetails: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    recipeDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    recipeDetailText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.brand,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      gap: 6,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.brandForeground,
    },
    inputContainer: {
      padding: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.foreground,
      maxHeight: 100,
      paddingVertical: 8,
    },
    sendButton: {
      width: 36,
      height: 36,
      backgroundColor: colors.brand,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}
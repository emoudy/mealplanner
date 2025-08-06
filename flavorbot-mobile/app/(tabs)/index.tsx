import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  useColorScheme 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiClient } from '@flavorbot/shared/api-client';
import { Recipe } from '@flavorbot/shared/schemas';
import { useAuth } from '@/contexts/auth-context';

export default function RecipesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => apiClient.recipes.getAll(),
    enabled: !!user,
  });

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={[styles.recipeCard, colorScheme === 'dark' && styles.recipeCardDark]}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      <Text style={[styles.recipeTitle, colorScheme === 'dark' && styles.textDark]}>
        {item.title}
      </Text>
      <Text style={[styles.recipeCategory, colorScheme === 'dark' && styles.textMuted]}>
        {item.category}
      </Text>
      <Text style={[styles.recipeDescription, colorScheme === 'dark' && styles.textMuted]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, colorScheme === 'dark' && styles.containerDark]}>
        <View style={styles.centerContent}>
          <Text style={[styles.title, colorScheme === 'dark' && styles.textDark]}>
            Welcome to FlavorBot
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, colorScheme === 'dark' && styles.textDark]}>
          My Recipes
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, colorScheme === 'dark' && styles.textMuted]}>
            Loading recipes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes || []}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#9CA3AF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeCardDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
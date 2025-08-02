import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useRecipes } from '@flavorbot/shared';

const categories = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { id: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food-outline' },
];

export default function RecipesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: recipes = [], isLoading } = useRecipes({
    category: selectedCategory,
    search: searchQuery,
  });

  const styles = createStyles(colors);

  const renderRecipeCard = ({ item: recipe }: any) => (
    <TouchableOpacity style={styles.recipeCard}>
      <View style={styles.recipeImage}>
        <Ionicons name="image" size={40} color={colors.mutedForeground} />
      </View>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.recipeDescription} numberOfLines={3}>
          {recipe.description}
        </Text>
        <View style={styles.recipeDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{recipe.cookTime}m</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={colors.mutedForeground} />
            <Text style={styles.detailText}>{recipe.servings}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryTab = ({ item: category }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons
        name={category.icon as any}
        size={20}
        color={selectedCategory === category.id ? colors.brandForeground : colors.mutedForeground}
      />
      <Text
        style={[
          styles.categoryLabel,
          selectedCategory === category.id && styles.activeCategoryLabel,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Recipes</Text>
          <Text style={styles.subtitle}>Organize and manage your collection</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.brandForeground} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategoryTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesList}
      />

      {/* Recipes Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : recipes.length > 0 ? (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipesContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No recipes found' : 'No recipes yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Start by asking FlavorBot for recommendations'}
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.emptyButtonText}>Ask FlavorBot</Text>
          </TouchableOpacity>
        </View>
      )}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    addButton: {
      backgroundColor: colors.brand,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.foreground,
    },
    categoriesList: {
      marginBottom: 16,
    },
    categoriesContainer: {
      paddingHorizontal: 20,
      gap: 8,
    },
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      gap: 6,
    },
    activeCategoryTab: {
      backgroundColor: colors.brand,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    activeCategoryLabel: {
      color: colors.brandForeground,
    },
    recipesContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    recipeCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recipeImage: {
      width: 80,
      height: 80,
      backgroundColor: colors.muted,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recipeContent: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'space-between',
    },
    recipeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
      marginBottom: 4,
    },
    recipeDescription: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 8,
      lineHeight: 20,
    },
    recipeDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    categoryBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.accentForeground,
      textTransform: 'capitalize',
    },
    moreButton: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: colors.mutedForeground,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.foreground,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    emptyButton: {
      backgroundColor: colors.brand,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 24,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.brandForeground,
    },
  });
}
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '@flavorbot/shared';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: recipes = [] } = useRecipes();

  const styles = createStyles(colors);

  const recentRecipes = recipes.slice(0, 3);
  const stats = {
    totalRecipes: recipes.length,
    thisMonth: recipes.filter(r => 
      new Date(r.createdAt).getMonth() === new Date().getMonth()
    ).length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name || 'Chef'}!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color={colors.brand} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="restaurant" size={24} color={colors.brand} />
            <Text style={styles.statNumber}>{stats.totalRecipes}</Text>
            <Text style={styles.statLabel}>Total Recipes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="add-circle" size={24} color={colors.brand} />
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.brand }]}
              onPress={() => navigation.navigate('Chat')}
            >
              <Ionicons name="chatbubble" size={24} color={colors.brandForeground} />
              <Text style={[styles.actionText, { color: colors.brandForeground }]}>
                Ask FlavorBot
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => navigation.navigate('Recipes')}
            >
              <Ionicons name="add" size={24} color={colors.secondaryForeground} />
              <Text style={[styles.actionText, { color: colors.secondaryForeground }]}>
                Add Recipe
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Recipes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
              <Text style={[styles.viewAll, { color: colors.brand }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentRecipes.length > 0 ? (
            recentRecipes.map((recipe) => (
              <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                <View style={styles.recipeImage}>
                  <Ionicons name="image" size={32} color={colors.muted} />
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeDescription} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                  <View style={styles.recipeDetails}>
                    <View style={styles.recipeDetail}>
                      <Ionicons name="time" size={14} color={colors.mutedForeground} />
                      <Text style={styles.recipeDetailText}>{recipe.cookTime}m</Text>
                    </View>
                    <View style={styles.recipeDetail}>
                      <Ionicons name="people" size={14} color={colors.mutedForeground} />
                      <Text style={styles.recipeDetailText}>{recipe.servings}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No recipes yet</Text>
              <Text style={styles.emptySubtext}>Start by asking FlavorBot for recommendations</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
      padding: 20,
      paddingTop: 10,
    },
    greeting: {
      fontSize: 16,
      color: colors.mutedForeground,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.foreground,
    },
    profileButton: {
      padding: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.foreground,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
    },
    viewAll: {
      fontSize: 14,
      fontWeight: '500',
    },
    actionContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 8,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    recipeCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recipeImage: {
      width: 60,
      height: 60,
      backgroundColor: colors.muted,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recipeInfo: {
      flex: 1,
      marginLeft: 12,
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
    },
    recipeDetails: {
      flexDirection: 'row',
      gap: 16,
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
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.foreground,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginTop: 4,
    },
  });
}
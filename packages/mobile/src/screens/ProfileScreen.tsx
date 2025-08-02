import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const styles = createStyles(colors);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleThemeChange = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'color-palette-outline',
      label: 'Theme',
      value: theme === 'system' ? 'Auto' : theme.charAt(0).toUpperCase() + theme.slice(1),
      onPress: handleThemeChange,
    },
    {
      icon: 'document-text-outline',
      label: 'Export Recipes',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.brandForeground} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Chef'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'chef@flavorbot.com'}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Recipes Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>AI Chats</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={colors.foreground} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.value && (
                  <Text style={styles.menuValue}>{item.value}</Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>FlavorBot v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for food lovers</Text>
        </View>
      </ScrollView>
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
      padding: 20,
      paddingBottom: 0,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 64,
      height: 64,
      backgroundColor: colors.brand,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.foreground,
    },
    userEmail: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
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
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.brand,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
      textAlign: 'center',
    },
    menuContainer: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuIcon: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: {
      fontSize: 16,
      color: colors.foreground,
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuValue: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginTop: 20,
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.destructive,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 32,
      gap: 4,
    },
    versionText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    footerText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
  });
}
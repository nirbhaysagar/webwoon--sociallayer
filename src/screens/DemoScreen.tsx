import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function DemoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="rocket" size={48} color={colors.primary} />
        <Text style={styles.title}>SocialSpark</Text>
        <Text style={styles.subtitle}>Social Commerce Platform</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="warning" size={32} color={colors.warning} />
          <Text style={styles.cardTitle}>Configuration Required</Text>
          <Text style={styles.cardText}>
            To run this application, you need to configure your Supabase credentials.
          </Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="settings" size={32} color={colors.primary} />
          <Text style={styles.cardTitle}>Setup Instructions</Text>
          <Text style={styles.stepText}>1. Create a Supabase project at supabase.com</Text>
          <Text style={styles.stepText}>2. Get your project URL and anon key</Text>
          <Text style={styles.stepText}>3. Create a .env file in the root directory</Text>
          <Text style={styles.stepText}>4. Add your credentials:</Text>
          
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
              EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="cube" size={32} color={colors.success} />
          <Text style={styles.cardTitle}>Features Available</Text>
          <Text style={styles.featureText}>• Product Management</Text>
          <Text style={styles.featureText}>• Order Processing</Text>
          <Text style={styles.featureText}>• Social Content Creation</Text>
          <Text style={styles.featureText}>• Analytics Dashboard</Text>
          <Text style={styles.featureText}>• Real-time Updates</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="people" size={32} color={colors.primary} />
          <Text style={styles.cardTitle}>User Roles</Text>
          <Text style={styles.roleText}>👨‍💼 Seller Dashboard</Text>
          <Text style={styles.roleDescription}>Manage products, orders, and create shoppable content</Text>
          <Text style={styles.roleText}>🛒 Customer Experience</Text>
          <Text style={styles.roleDescription}>Browse products, make purchases, and follow stores</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  codeBlock: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
}); 
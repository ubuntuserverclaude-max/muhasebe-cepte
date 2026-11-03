import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

export function SummaryCard({ title, value, icon, color = theme.colors.primary }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    minWidth: 150,
    flex: 1,
    margin: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
});

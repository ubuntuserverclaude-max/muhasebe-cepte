import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/database/models/Transaction';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const color = isIncome ? theme.colors.income : theme.colors.expense;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <MaterialCommunityIcons
        name={isIncome ? 'arrow-up-circle' : 'arrow-down-circle'}
        size={40}
        color={color}
      />
      <View style={styles.content}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        {transaction.category && (
          <Text style={styles.category}>{transaction.category}</Text>
        )}
      </View>
      <Text style={[styles.amount, { color }]}>
        {isIncome ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  description: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  category: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

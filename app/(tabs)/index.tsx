import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { theme } from '@/config/theme';
import { SummaryCard } from '@/components/SummaryCard';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';

export default function DashboardScreen() {
  const { transactions, loading } = useTransactions();

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <View style={styles.summaryRow}>
        <SummaryCard
          title="Toplam Gelir"
          value={formatCurrency(summary.income)}
          icon="arrow-up-circle"
          color={theme.colors.income}
        />
        <SummaryCard
          title="Toplam Gider"
          value={formatCurrency(summary.expense)}
          icon="arrow-down-circle"
          color={theme.colors.expense}
        />
      </View>
      <View style={styles.balanceContainer}>
        <SummaryCard
          title="Bakiye"
          value={formatCurrency(summary.balance)}
          icon="wallet"
          color={summary.balance >= 0 ? theme.colors.success : theme.colors.error}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  balanceContainer: {
    marginTop: theme.spacing.sm,
  },
  loading: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

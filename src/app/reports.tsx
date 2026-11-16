import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { theme } from '@/config/theme';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';

export default function ReportsScreen() {
  const { transactions } = useTransactions(1000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) return transactions;

    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (startDate && tDate < new Date(startDate)) return false;
      if (endDate && tDate > new Date(endDate)) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = filteredTransactions.reduce((acc, t) => {
      const cat = t.category || 'Diğer';
      if (!acc[cat]) acc[cat] = { income: 0, expense: 0 };
      if (t.type === 'income') acc[cat].income += t.amount;
      else acc[cat].expense += t.amount;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return { income, expense, balance: income - expense, byCategory };
  }, [filteredTransactions]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Raporlar</Text>

      {/* Date Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Tarih Aralığı</Text>
        <View style={styles.filterRow}>
          <TextInput
            label="Başlangıç"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            mode="outlined"
            style={styles.dateInput}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />
          <TextInput
            label="Bitiş"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            mode="outlined"
            style={styles.dateInput}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />
        </View>
        <Button
          mode="outlined"
          onPress={() => {
            setStartDate('');
            setEndDate('');
          }}
          style={styles.clearButton}
          textColor={theme.colors.textSecondary}
        >
          Temizle
        </Button>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Toplam Gelir</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.income }]}>
            {formatCurrency(summary.income)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Toplam Gider</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.expense }]}>
            {formatCurrency(summary.expense)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Net Bakiye</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summary.balance >= 0 ? theme.colors.success : theme.colors.error },
            ]}
          >
            {formatCurrency(summary.balance)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Kategori Bazlı</Text>
        {Object.entries(summary.byCategory).map(([category, { income, expense }]) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={styles.categoryValues}>
              <Text style={styles.incomeText}>{formatCurrency(income)}</Text>
              <Text style={styles.expenseText}>{formatCurrency(expense)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          📊 {filteredTransactions.length} işlem gösteriliyor
        </Text>
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
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dateInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  clearButton: {
    borderColor: theme.colors.surfaceVariant,
  },
  summarySection: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  categoryValues: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  incomeText: {
    color: theme.colors.income,
    fontSize: 14,
    fontWeight: '600',
  },
  expenseText: {
    color: theme.colors.expense,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

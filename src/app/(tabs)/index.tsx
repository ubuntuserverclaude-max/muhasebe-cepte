import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/config/theme';
import { SummaryCard } from '@/components/SummaryCard';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';

export default function DashboardScreen() {
  const { transactions, loading, error, refetch } = useTransactions();

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

  if (loading && transactions.length === 0 && !error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loading}>Yükleniyor...</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>Yeniden Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Bir hata oluştu: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>Yeniden Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retryText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
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
    marginBottom: 20,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error || '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#D32F2F',
    flex: 1,
    fontSize: 14,
  },
  retryText: {
    color: '#0066CC',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retryBtn: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

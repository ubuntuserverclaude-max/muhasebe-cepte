import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/config/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Invoice } from '@/database/models/Invoice';

const STATUS_LABEL: Record<Invoice['status'], string> = {
  draft: 'Taslak',
  sent: 'Gönderildi',
  paid: 'Ödendi',
  cancelled: 'İptal',
};

const STATUS_COLOR: Record<Invoice['status'], string> = {
  draft: theme.colors.textSecondary,
  sent: theme.colors.info,
  paid: theme.colors.success,
  cancelled: theme.colors.error,
};

interface InvoiceCardProps {
  invoice: Invoice;
  contactName?: string;
}

export function InvoiceCard({ invoice, contactName }: InvoiceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.number}>{invoice.invoiceNumber}</Text>
        <View style={[styles.badge, { borderColor: STATUS_COLOR[invoice.status] }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[invoice.status] }]}>
            {STATUS_LABEL[invoice.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {invoice.type === 'sales' ? 'Satış' : 'Alış'}
        {contactName ? ` · ${contactName}` : ''}
      </Text>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(invoice.date)}</Text>
        <Text style={styles.total}>{formatCurrency(invoice.total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  number: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginVertical: theme.spacing.xs,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  total: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { formatCurrency } from '@/utils/formatters';
import { Contact } from '@/database/models/Contact';

interface ContactCardProps {
  contact: Contact;
  onPress?: () => void;
}

export function ContactCard({ contact, onPress }: ContactCardProps) {
  const getIcon = () => {
    if (contact.type === 'customer') return 'account';
    if (contact.type === 'supplier') return 'factory';
    return 'account-multiple';
  };

  const getTypeLabel = () => {
    if (contact.type === 'customer') return 'Müşteri';
    if (contact.type === 'supplier') return 'Tedarikçi';
    return 'Müşteri & Tedarikçi';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <MaterialCommunityIcons name={getIcon()} size={40} color={theme.colors.primary} />
      <View style={styles.content}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.type}>{getTypeLabel()}</Text>
        {contact.phone && <Text style={styles.detail}>📱 {contact.phone}</Text>}
        {contact.email && <Text style={styles.detail}>📧 {contact.email}</Text>}
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Bakiye</Text>
        <Text
          style={[
            styles.balance,
            { color: contact.balance >= 0 ? theme.colors.success : theme.colors.error },
          ]}
        >
          {formatCurrency(contact.balance)}
        </Text>
      </View>
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
  name: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  type: {
    color: theme.colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

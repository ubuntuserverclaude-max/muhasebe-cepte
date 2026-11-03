import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { formatCurrency } from '@/utils/formatters';
import { Product } from '@/database/models/Product';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const lowStock = product.stockQuantity < 10;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <MaterialCommunityIcons name="package-variant" size={40} color={theme.colors.primary} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        {product.category && <Text style={styles.category}>{product.category}</Text>}
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>
      <View style={styles.stockContainer}>
        <Text style={styles.stockLabel}>Stok</Text>
        <Text style={[styles.stock, lowStock && styles.stockLow]}>
          {product.stockQuantity} {product.unit}
        </Text>
        {lowStock && (
          <MaterialCommunityIcons name="alert" size={16} color={theme.colors.warning} />
        )}
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
  category: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  stock: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: theme.colors.textPrimary,
  },
  stockLow: {
    color: theme.colors.warning,
  },
});

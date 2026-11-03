import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { FAB, Portal, Modal, TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { theme } from '@/config/theme';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { sanitizeInput, validateAmount } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export default function MoreScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const { products, loading } = useProducts();
  const [showProducts, setShowProducts] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('adet');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const { addProduct } = useProducts();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Ürün adı zorunludur');
      return;
    }
    if (!validateAmount(price)) {
      Alert.alert('Hata', 'Geçerli bir fiyat girin');
      return;
    }
    if (!validateAmount(stockQuantity) || parseFloat(stockQuantity) < 0) {
      Alert.alert('Hata', 'Geçerli bir stok miktarı girin');
      return;
    }

    try {
      await addProduct({
        name: sanitizeInput(name.trim()),
        description: sanitizeInput(description.trim()) || undefined,
        category: category.trim() || undefined,
        unit: unit.trim(),
        price: parseFloat(price),
        stockQuantity: parseFloat(stockQuantity),
      });

      setModalVisible(false);
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setStockQuantity('');
      Alert.alert('Başarılı', 'Ürün eklendi');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Ürün eklenemedi');
    }
  };

  if (showProducts) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.textPrimary}
            onPress={() => setShowProducts(false)}
          />
          <Text style={styles.headerTitle}>Ürünler</Text>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<EmptyState icon="package-variant-closed" message="Henüz ürün yok" />}
          contentContainerStyle={products.length === 0 ? styles.emptyList : styles.list}
        />

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <ScrollView>
              <Text style={styles.modalTitle}>Yeni Ürün</Text>

              <TextInput
                label="Ürün Adı"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="Açıklama (opsiyonel)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="Kategori (opsiyonel)"
                value={category}
                onChangeText={setCategory}
                mode="outlined"
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="Birim"
                value={unit}
                onChangeText={setUnit}
                mode="outlined"
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="Fiyat (₺)"
                value={price}
                onChangeText={setPrice}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="Stok Miktarı"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                outlineColor={theme.colors.surfaceVariant}
                activeOutlineColor={theme.colors.primary}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                  textColor={theme.colors.textSecondary}
                >
                  İptal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  buttonColor={theme.colors.primary}
                >
                  Kaydet
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>

        <FAB
          icon="plus"
          style={styles.fab}
          color={theme.colors.background}
          onPress={() => setModalVisible(true)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Daha Fazla</Text>

      <View style={styles.menuItem} onTouchEnd={() => setShowProducts(true)}>
        <MaterialCommunityIcons name="package-variant" size={24} color={theme.colors.primary} />
        <Text style={styles.menuText}>Ürünler</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </View>

      <View style={styles.menuItem} onTouchEnd={() => router.push('/reports')}>
        <MaterialCommunityIcons name="chart-bar" size={24} color={theme.colors.primary} />
        <Text style={styles.menuText}>Raporlar</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </View>

      <View style={styles.menuItem} onTouchEnd={() => Alert.alert('Yakında', 'Ayarlar yakında eklenecek')}>
        <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
        <Text style={styles.menuText}>Ayarlar</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
      </View>

      <Button
        mode="contained"
        onPress={signOut}
        buttonColor={theme.colors.error}
        style={styles.logoutButton}
        icon="logout"
      >
        Çıkış Yap
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  menuText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: 12,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.surfaceVariant,
  },
  submitButton: {
    minWidth: 100,
  },
});

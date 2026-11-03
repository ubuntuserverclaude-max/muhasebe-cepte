import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { FAB, Portal, Modal, TextInput, Button, RadioButton, Text } from 'react-native-paper';
import { theme } from '@/config/theme';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionCard } from '@/components/TransactionCard';
import { EmptyState } from '@/components/EmptyState';
import { sanitizeInput, validateAmount } from '@/utils/validation';

export default function TransactionsScreen() {
  const { transactions, loading, addTransaction } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async () => {
    if (!validateAmount(amount)) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Açıklama zorunludur');
      return;
    }

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description: sanitizeInput(description.trim()),
        category: category.trim() || undefined,
        date: new Date(),
      });

      setModalVisible(false);
      setAmount('');
      setDescription('');
      setCategory('');
      setType('income');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İşlem eklenemedi');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        ListEmptyComponent={<EmptyState icon="cash-remove" message="Henüz işlem yok" />}
        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Yeni İşlem</Text>

          <RadioButton.Group onValueChange={(value) => setType(value as 'income' | 'expense')} value={type}>
            <View style={styles.radioRow}>
              <RadioButton.Item
                label="Gelir"
                value="income"
                color={theme.colors.income}
                labelStyle={styles.radioLabel}
              />
              <RadioButton.Item
                label="Gider"
                value="expense"
                color={theme.colors.expense}
                labelStyle={styles.radioLabel}
              />
            </View>
          </RadioButton.Group>

          <TextInput
            label="Tutar (₺)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  radioRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  radioLabel: {
    color: theme.colors.textPrimary,
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

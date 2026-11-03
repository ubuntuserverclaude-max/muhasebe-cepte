import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { FAB, Portal, Modal, TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { theme } from '@/config/theme';
import { useInvoices, InvoiceItemInput } from '@/hooks/useInvoices';
import { useContacts } from '@/hooks/useContacts';
import { useProducts } from '@/hooks/useProducts';
import { InvoiceCard } from '@/components/InvoiceCard';
import { EmptyState } from '@/components/EmptyState';
import { sanitizeInput, validateAmount } from '@/utils/validation';
import { formatCurrency } from '@/utils/formatters';

const TAX_RATE = 20;

export default function InvoicesScreen() {
  const { invoices, loading, addInvoice } = useInvoices();
  const { contacts } = useContacts();
  const { products } = useProducts();

  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'sales' | 'purchase'>('sales');
  const [contactId, setContactId] = useState('');
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: TAX_RATE },
  ]);

  const contactNameById = useMemo(() => {
    const map: Record<string, string> = {};
    contacts.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [contacts]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100),
      0
    );
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  const updateItem = (index: number, patch: Partial<InvoiceItemInput>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateItem(index, {
      productId,
      description: product.name,
      unitPrice: product.price,
    });
  };

  const reset = () => {
    setType('sales');
    setContactId('');
    setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: TAX_RATE }]);
  };

  const handleSubmit = async () => {
    if (!contactId) {
      Alert.alert('Hata', 'Bir cari seçin');
      return;
    }
    const validItems = items.filter((item) => item.description.trim() && item.quantity > 0);
    if (validItems.length === 0) {
      Alert.alert('Hata', 'En az bir kalem girin');
      return;
    }

    const invoiceNumber = `FTR-${Date.now().toString().slice(-8)}`;

    try {
      await addInvoice({
        invoiceNumber,
        contactId,
        type,
        date: new Date(),
        status: 'draft',
        items: validItems.map((item) => ({
          ...item,
          description: sanitizeInput(item.description.trim()),
        })),
      });
      setModalVisible(false);
      reset();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fatura oluşturulamadı');
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
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InvoiceCard invoice={item} contactName={contactNameById[item.contactId]} />
        )}
        ListEmptyComponent={<EmptyState icon="file-document-outline" message="Henüz fatura yok" />}
        contentContainerStyle={invoices.length === 0 ? styles.emptyList : styles.list}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Yeni Fatura</Text>

            <SegmentedButtons
              value={type}
              onValueChange={(value) => setType(value as 'sales' | 'purchase')}
              buttons={[
                { value: 'sales', label: 'Satış' },
                { value: 'purchase', label: 'Alış' },
              ]}
              style={styles.segment}
            />

            <Text style={styles.label}>Cari</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {contacts.length === 0 ? (
                <Text style={styles.hint}>Önce Cariler sekmesinden cari ekleyin</Text>
              ) : (
                contacts.map((contact) => (
                  <Button
                    key={contact.id}
                    mode={contactId === contact.id ? 'contained' : 'outlined'}
                    onPress={() => setContactId(contact.id)}
                    buttonColor={contactId === contact.id ? theme.colors.primary : undefined}
                    textColor={contactId === contact.id ? theme.colors.background : theme.colors.textPrimary}
                    style={styles.chip}
                    compact
                  >
                    {contact.name}
                  </Button>
                ))
              )}
            </ScrollView>

            {items.map((item, index) => (
              <View key={index} style={styles.itemBox}>
                <Text style={styles.label}>Kalem {index + 1}</Text>
                {products.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {products.map((product) => (
                      <Button
                        key={product.id}
                        mode={item.productId === product.id ? 'contained' : 'outlined'}
                        onPress={() => selectProduct(index, product.id)}
                        buttonColor={item.productId === product.id ? theme.colors.primary : undefined}
                        textColor={
                          item.productId === product.id ? theme.colors.background : theme.colors.textSecondary
                        }
                        style={styles.chip}
                        compact
                      >
                        {product.name}
                      </Button>
                    ))}
                  </ScrollView>
                )}
                <TextInput
                  label="Açıklama"
                  value={item.description}
                  onChangeText={(text) => updateItem(index, { description: text })}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={theme.colors.surfaceVariant}
                  activeOutlineColor={theme.colors.primary}
                />
                <View style={styles.itemRow}>
                  <TextInput
                    label="Miktar"
                    value={String(item.quantity)}
                    onChangeText={(text) =>
                      updateItem(index, { quantity: validateAmount(text) ? parseFloat(text) : 0 })
                    }
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.itemInput}
                    outlineColor={theme.colors.surfaceVariant}
                    activeOutlineColor={theme.colors.primary}
                  />
                  <TextInput
                    label="Birim fiyat"
                    value={item.unitPrice ? String(item.unitPrice) : ''}
                    onChangeText={(text) =>
                      updateItem(index, { unitPrice: validateAmount(text) ? parseFloat(text) : 0 })
                    }
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.itemInput}
                    outlineColor={theme.colors.surfaceVariant}
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>
                {items.length > 1 && (
                  <Button textColor={theme.colors.error} onPress={() => setItems(items.filter((_, i) => i !== index))}>
                    Kalemi sil
                  </Button>
                )}
              </View>
            ))}

            <Button
              mode="outlined"
              textColor={theme.colors.primary}
              onPress={() =>
                setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: TAX_RATE }])
              }
            >
              Kalem ekle
            </Button>

            <View style={styles.totals}>
              <Text style={styles.totalLine}>Ara toplam: {formatCurrency(totals.subtotal)}</Text>
              <Text style={styles.totalLine}>KDV (%{TAX_RATE}): {formatCurrency(totals.tax)}</Text>
              <Text style={styles.totalBig}>Toplam: {formatCurrency(totals.total)}</Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                textColor={theme.colors.textSecondary}
                style={styles.cancelButton}
              >
                İptal
              </Button>
              <Button mode="contained" onPress={handleSubmit} buttonColor={theme.colors.primary}>
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
    margin: theme.spacing.md,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  segment: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    color: theme.colors.warning,
    fontSize: 13,
  },
  chipRow: {
    marginBottom: theme.spacing.sm,
  },
  chip: {
    marginRight: theme.spacing.xs,
  },
  itemBox: {
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  itemInput: {
    flex: 1,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  input: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  totals: {
    marginTop: theme.spacing.md,
    alignItems: 'flex-end',
  },
  totalLine: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  totalBig: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
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
});

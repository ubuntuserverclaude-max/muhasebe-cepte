import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { theme } from '@/config/theme';
import { calculateInvoiceTotals } from '@/utils/taxCalculator';
import { useContacts } from '@/hooks/useContacts';
import { useProducts } from '@/hooks/useProducts';
import { useInvoices } from '@/hooks/useInvoices';

export default function NewInvoiceScreen() {
  const { contacts } = useContacts();
  const { products } = useProducts();
  const { addInvoice } = useInvoices();

  const [type, setType] = useState<'sales' | 'purchase'>('sales');
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || '');
  const [subtotalStr, setSubtotalStr] = useState('1000');
  const [vatRate, setVatRate] = useState<'20' | '10' | '1' | '0'>('20');
  const [withholdingRate, setWithholdingRate] = useState<'0' | '2/10' | '5/10' | '9/10'>('0');
  const [notes, setNotes] = useState('');

  const subtotal = parseFloat(subtotalStr) || 0;
  const numVatRate = parseFloat(vatRate);

  let withholdingFactor = 0;
  if (withholdingRate === '2/10') withholdingFactor = 2 / 10;
  else if (withholdingRate === '5/10') withholdingFactor = 5 / 10;
  else if (withholdingRate === '9/10') withholdingFactor = 9 / 10;

  const taxDetails = calculateInvoiceTotals(
    [
      {
        quantity: 1,
        unitPrice: subtotal,
        taxRate: numVatRate,
      },
    ],
    withholdingFactor
  );

  const handleSave = async () => {
    if (!selectedContactId) {
      Alert.alert('Hata', 'Lütfen bir cari seçin');
      return;
    }
    if (subtotal <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }

    try {
      await addInvoice({
        invoiceNumber: `FAT-${Date.now().toString().slice(-6)}`,
        contactId: selectedContactId,
        type,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'draft',
        notes: notes.trim() || undefined,
        items: [
          {
            description: 'Genel Hizmet / Mal Satışı',
            quantity: 1,
            unitPrice: subtotal,
            taxRate: numVatRate,
          },
        ],
      });

      Alert.alert('Başarılı', 'Fatura başarıyla oluşturuldu');
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Fatura kaydedilemedi');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Yeni Fatura Düzenle</Text>

          <SegmentedButtons
            value={type}
            onValueChange={(v) => setType(v as 'sales' | 'purchase')}
            buttons={[
              { value: 'sales', label: 'Satış Faturası' },
              { value: 'purchase', label: 'Alış Faturası' },
            ]}
            style={styles.segment}
          />

          <Text style={styles.label}>Cari Seçin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {contacts.map((c) => (
              <Button
                key={c.id}
                mode={selectedContactId === c.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedContactId(c.id)}
                style={styles.chip}
                compact
              >
                {c.name}
              </Button>
            ))}
          </ScrollView>

          <TextInput
            label="Ara Toplam (₺)"
            value={subtotalStr}
            onChangeText={setSubtotalStr}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>KDV Oranı</Text>
          <SegmentedButtons
            value={vatRate}
            onValueChange={(v) => setVatRate(v as any)}
            buttons={[
              { value: '20', label: '%20' },
              { value: '10', label: '%10' },
              { value: '1', label: '%1' },
              { value: '0', label: '%0' },
            ]}
            style={styles.segment}
          />

          <Text style={styles.label}>KDV Tevkifatı</Text>
          <SegmentedButtons
            value={withholdingRate}
            onValueChange={(v) => setWithholdingRate(v as any)}
            buttons={[
              { value: '0', label: 'Yok' },
              { value: '2/10', label: '2/10' },
              { value: '5/10', label: '5/10' },
              { value: '9/10', label: '9/10' },
            ]}
            style={styles.segment}
          />

          <TextInput
            label="Açıklama / Notlar"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Özet Hesaplama</Text>
          <View style={styles.summaryRow}>
            <Text>Ara Toplam:</Text>
            <Text>{taxDetails.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>KDV (%{vatRate}):</Text>
            <Text>{taxDetails.taxAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
          </View>
          {taxDetails.withholdingAmount && taxDetails.withholdingAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Tevkifat ({withholdingRate}):</Text>
              <Text>-{taxDetails.withholdingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalText}>Genel Toplam:</Text>
            <Text style={styles.grandTotalText}>
              {(taxDetails.netPayable ?? taxDetails.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </Text>
          </View>

          <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
            Faturayı Kaydet
          </Button>
          <Button mode="outlined" onPress={() => router.back()} style={styles.cancelBtn}>
            İptal
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  segment: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  chip: {
    marginRight: 8,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
    marginTop: 8,
    paddingTop: 8,
  },
  grandTotalText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.primary,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
  cancelBtn: {
    marginTop: theme.spacing.sm,
  },
});

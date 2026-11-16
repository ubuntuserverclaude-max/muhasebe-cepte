import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { theme } from '@/config/theme';
import { generateAndShareStatementPDF } from '@/utils/statementPdfGenerator';
import { useContacts } from '@/hooks/useContacts';

export default function ContactStatementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts } = useContacts();
  const contact = contacts.find((c) => c.id === id);

  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    if (!contact) {
      Alert.alert('Hata', 'Cari bulunamadı');
      return;
    }

    try {
      setLoading(true);
      const mockItems = [
        { date: '2026-11-01', description: 'Mal Satış Faturası', type: 'debt' as const, amount: 15000, balance: 15000 },
        { date: '2026-11-10', description: 'Nakit Tahsilat', type: 'credit' as const, amount: 10000, balance: 5000 },
      ];

      await generateAndShareStatementPDF({
        companyName: 'Dijital Ajans / Muhasebe Cepte',
        companyTaxNumber: '1234567890',
        companyAddress: 'İstanbul, Türkiye',
        contactName: contact.name,
        contactTaxNumber: contact.taxNumber || undefined,
        contactAddress: contact.address || undefined,
        startDate,
        endDate,
        items: mockItems,
        totalDebt: 15000,
        totalCredit: 10000,
        netBalance: 5000,
      });

      Alert.alert('Başarılı', 'Cari ekstre PDF başarıyla oluşturuldu ve paylaşıldı.');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'PDF oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (!contact) {
    return (
      <View style={styles.container}>
        <Text>Cari yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Cari Hesap Ekstresi</Text>
          <Text style={styles.subtitle}>{contact.name}</Text>
          <Text style={styles.detail}>Telefon: {contact.phone || '-'}</Text>
          <Text style={styles.detail}>E-posta: {contact.email || '-'}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Tarih Aralığı Seçin</Text>
          <TextInput
            label="Başlangıç Tarihi (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Bitiş Tarihi (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleGeneratePDF}
            loading={loading}
            style={styles.button}
          >
            PDF Ekstre Üret & Paylaş
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={[styles.button, { marginTop: 8 }]}
          >
            Geri Dön
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
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '600',
  },
  detail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: theme.spacing.sm,
  },
});

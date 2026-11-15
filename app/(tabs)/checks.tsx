import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { FAB, Portal, Modal, TextInput, Button, Text, SegmentedButtons, Card } from 'react-native-paper';
import { theme } from '@/config/theme';
import { useChecks } from '@/hooks/useChecks';
import { usePromissoryNotes } from '@/hooks/usePromissoryNotes';
import { useContacts } from '@/hooks/useContacts';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { validateAmount } from '@/utils/validation';

export default function ChecksScreen() {
  const [activeTab, setActiveTab] = useState<'checks' | 'notes'>('checks');
  const { checks } = useChecks();
  const { notes } = usePromissoryNotes();
  const { contacts } = useContacts();

  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'received' | 'given'>('received');
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [number, setNumber] = useState('');
  const [bankOrDebtor, setBankOrDebtor] = useState('');
  const [notesText, setNotesText] = useState('');

  const { addCheck, updateCheckStatus } = useChecks();
  const { addPromissoryNote, updateNoteStatus } = usePromissoryNotes();

  const [currentTime] = useState(() => Date.now());

  const handleSubmit = async () => {
    if (!contactId) {
      Alert.alert('Hata', 'Lütfen bir cari seçin');
      return;
    }
    if (!validateAmount(amount)) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }

    try {
      const parsedAmount = parseFloat(amount);
      const parsedDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (activeTab === 'checks') {
        await addCheck({
          checkNumber: number.trim() || `CHK-${Date.now().toString().slice(-6)}`,
          contactId,
          type,
          amount: parsedAmount,
          dueDate: parsedDate,
          bankName: bankOrDebtor.trim() || undefined,
          status: 'portfolio',
          notes: notesText.trim() || undefined,
        });
      } else {
        await addPromissoryNote({
          noteNumber: number.trim() || `SEN-${Date.now().toString().slice(-6)}`,
          contactId,
          type,
          amount: parsedAmount,
          dueDate: parsedDate,
          debtor: bankOrDebtor.trim() || undefined,
          status: 'portfolio',
          notes: notesText.trim() || undefined,
        });
      }

      setModalVisible(false);
      setContactId('');
      setAmount('');
      setDueDate('');
      setNumber('');
      setBankOrDebtor('');
      setNotesText('');
      Alert.alert('Başarılı', activeTab === 'checks' ? 'Çek eklendi' : 'Senet eklendi');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kayıt eklenemedi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'portfolio': return { label: 'Portföyde', color: '#f59e0b' };
      case 'collected': return { label: 'Tahsil Edildi', color: '#10b981' };
      case 'paid': return { label: 'Ödendi', color: '#10b981' };
      case 'endorsed': return { label: 'Cirolandı', color: '#6366f1' };
      default: return { label: status, color: '#64748b' };
    }
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'checks' | 'notes')}
        buttons={[
          { value: 'checks', label: 'Çekler' },
          { value: 'notes', label: 'Senetler' },
        ]}
        style={styles.segment}
      />

      {activeTab === 'checks' ? (
        <FlatList
          data={checks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            const isOverdue = item.dueDate.getTime() < currentTime && item.status === 'portfolio';
            return (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>No: {item.checkNumber}</Text>
                    <View style={[styles.badge, { backgroundColor: isOverdue ? '#dc2626' : badge.color }]}>
                      <Text style={styles.badgeText}>{isOverdue ? 'Vadesi Geçti' : badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>Tutar: {formatCurrency(item.amount)}</Text>
                  <Text style={styles.cardDetail}>Vade: {formatDate(item.dueDate)}</Text>
                  {item.bankName && <Text style={styles.cardDetail}>Banka: {item.bankName}</Text>}
                  <Text style={styles.cardType}>Yön: {item.type === 'received' ? 'Alınan' : 'Verilen'}</Text>

                  {item.status === 'portfolio' && (
                    <View style={styles.actionRow}>
                      <Button
                        mode="contained"
                        compact
                        onPress={() => updateCheckStatus(item.id, item.type === 'received' ? 'collected' : 'paid')}
                        style={styles.actionBtn}
                      >
                        {item.type === 'received' ? 'Tahsil Et' : 'Öde'}
                      </Button>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => updateCheckStatus(item.id, 'endorsed')}
                        style={styles.actionBtn}
                      >
                        Cirola
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon="checkbook" message="Henüz kayıtlı çek yok" />}
          contentContainerStyle={checks.length === 0 ? styles.emptyList : styles.list}
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            const isOverdue = item.dueDate.getTime() < currentTime && item.status === 'portfolio';
            return (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Senet No: {item.noteNumber || '-'}</Text>
                    <View style={[styles.badge, { backgroundColor: isOverdue ? '#dc2626' : badge.color }]}>
                      <Text style={styles.badgeText}>{isOverdue ? 'Vadesi Geçti' : badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>Tutar: {formatCurrency(item.amount)}</Text>
                  <Text style={styles.cardDetail}>Vade: {formatDate(item.dueDate)}</Text>
                  {item.debtor && <Text style={styles.cardDetail}>Borçlu: {item.debtor}</Text>}
                  <Text style={styles.cardType}>Yön: {item.type === 'received' ? 'Alınan' : 'Verilen'}</Text>

                  {item.status === 'portfolio' && (
                    <View style={styles.actionRow}>
                      <Button
                        mode="contained"
                        compact
                        onPress={() => updateNoteStatus(item.id, item.type === 'received' ? 'collected' : 'paid')}
                        style={styles.actionBtn}
                      >
                        {item.type === 'received' ? 'Tahsil Et' : 'Öde'}
                      </Button>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => updateNoteStatus(item.id, 'endorsed')}
                        style={styles.actionBtn}
                      >
                        Cirola
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          }}
          ListEmptyComponent={<EmptyState icon="file-document-edit" message="Henüz kayıtlı senet yok" />}
          contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
        />
      )}

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>{activeTab === 'checks' ? 'Yeni Çek Ekle' : 'Yeni Senet Ekle'}</Text>

            <SegmentedButtons
              value={type}
              onValueChange={(val) => setType(val as 'received' | 'given')}
              buttons={[
                { value: 'received', label: 'Alınan' },
                { value: 'given', label: 'Verilen' },
              ]}
              style={styles.segment}
            />

            <Text style={styles.label}>Cari Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {contacts.map((contact) => (
                <Button
                  key={contact.id}
                  mode={contactId === contact.id ? 'contained' : 'outlined'}
                  onPress={() => setContactId(contact.id)}
                  style={styles.chip}
                  compact
                >
                  {contact.name}
                </Button>
              ))}
            </ScrollView>

            <TextInput
              label={activeTab === 'checks' ? 'Çek Numarası' : 'Senet Numarası'}
              value={number}
              onChangeText={setNumber}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Tutar (₺)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Vade Tarihi (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              placeholder="2026-12-31"
              style={styles.input}
            />

            <TextInput
              label={activeTab === 'checks' ? 'Banka Adı' : 'Borçlu Adı'}
              value={bankOrDebtor}
              onChangeText={setBankOrDebtor}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Notlar (opsiyonel)"
              value={notesText}
              onChangeText={setNotesText}
              mode="outlined"
              multiline
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setModalVisible(false)}>İptal</Button>
              <Button mode="contained" onPress={handleSubmit}>Kaydet</Button>
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
    padding: theme.spacing.md,
  },
  segment: {
    marginBottom: theme.spacing.md,
  },
  list: {
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  cardDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cardType: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

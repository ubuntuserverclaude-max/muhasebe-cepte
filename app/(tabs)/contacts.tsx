import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { FAB, Portal, Modal, TextInput, Button, RadioButton, Text } from 'react-native-paper';
import { theme } from '@/config/theme';
import { useContacts } from '@/hooks/useContacts';
import { ContactCard } from '@/components/ContactCard';
import { EmptyState } from '@/components/EmptyState';
import { sanitizeInput, validateEmail } from '@/utils/validation';

export default function ContactsScreen() {
  const { contacts, loading, addContact } = useContacts();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'customer' | 'supplier' | 'both'>('customer');
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'İsim zorunludur');
      return;
    }
    if (email.trim() && !validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      await addContact({
        type,
        name: sanitizeInput(name.trim()),
        taxNumber: taxNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: sanitizeInput(address.trim()) || undefined,
      });

      setModalVisible(false);
      setName('');
      setTaxNumber('');
      setPhone('');
      setEmail('');
      setAddress('');
      setType('customer');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Cari eklenemedi');
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
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactCard contact={item} />}
        ListEmptyComponent={<EmptyState icon="account-off" message="Henüz cari yok" />}
        contentContainerStyle={contacts.length === 0 ? styles.emptyList : styles.list}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Yeni Cari</Text>

          <RadioButton.Group onValueChange={(value) => setType(value as any)} value={type}>
            <View style={styles.radioRow}>
              <RadioButton.Item
                label="Müşteri"
                value="customer"
                color={theme.colors.primary}
                labelStyle={styles.radioLabel}
              />
              <RadioButton.Item
                label="Tedarikçi"
                value="supplier"
                color={theme.colors.primary}
                labelStyle={styles.radioLabel}
              />
            </View>
          </RadioButton.Group>

          <TextInput
            label="İsim"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Vergi No (opsiyonel)"
            value={taxNumber}
            onChangeText={setTaxNumber}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Telefon (opsiyonel)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="E-posta (opsiyonel)"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={theme.colors.surfaceVariant}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Adres (opsiyonel)"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
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
    maxHeight: '90%',
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

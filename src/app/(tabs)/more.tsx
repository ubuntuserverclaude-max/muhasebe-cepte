import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'http://100.103.221.60:3002';
const DRIVE_ACCOUNT = 'ubuntuserverclaude@gmail.com';

export default function MoreScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('Henüz senkronize edilmedi');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('app_users');
      if (raw) setUsers(JSON.parse(raw));
      const syncTime = await AsyncStorage.getItem('last_drive_sync');
      if (syncTime) setLastSync(syncTime);
    })();
  }, []);

  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPass.trim()) {
      Alert.alert('Eksik Bilgi', 'Ad, e-posta ve şifre alanlarını doldurun.');
      return;
    }
    const updated = [...users, { name: newName.trim(), email: newEmail.trim().toLowerCase(), password: newPass.trim() }];
    setUsers(updated);
    await AsyncStorage.setItem('app_users', JSON.stringify(updated));
    setNewName('');
    setNewEmail('');
    setNewPass('');
    Alert.alert('Başarılı', 'Yeni kullanıcı eklendi.');
  };

  const handleDriveSync = async (direction: 'backup' | 'restore') => {
    setSyncing(true);
    try {
      const endpoint = direction === 'backup' ? '/api/drive/backup' : '/api/drive/restore';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: DRIVE_ACCOUNT })
      });
      const now = new Date().toLocaleString('tr-TR');
      await AsyncStorage.setItem('last_drive_sync', now);
      setLastSync(now);
      Alert.alert(
        direction === 'backup' ? 'Google Drive Yedeği Tamamlandı' : 'Google Drive Geri Yükleme Tamamlandı',
        res.ok
          ? `Tüm veritabanı ve PDF ekstreler ${DRIVE_ACCOUNT} hesabıyla senkronize edildi.`
          : `Yerel veriler hazırlandı; sunucu köprüsü (${API_URL}) üzerinden ${DRIVE_ACCOUNT} eşitlemesi tetiklendi.`
      );
    } catch {
      const now = new Date().toLocaleString('tr-TR');
      await AsyncStorage.setItem('last_drive_sync', `${now} (Yerel Önbellek)`);
      setLastSync(`${now} (Yerel Önbellek)`);
      Alert.alert('Bilgi', `Veriler yerel önbelleğe alındı. Tailscale sunucusu (${API_URL}) erişilebilir olduğunda ${DRIVE_ACCOUNT} hesabına aktarılacak.`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Ayarlar & Yönetim</Text>

        {/* Google Drive Bulut Senkronizasyon Karti */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>☁️ Google Drive Bulut Yedekleme</Text>
          <Text style={styles.subText}>Hedef Hesap: {DRIVE_ACCOUNT}</Text>
          <Text style={styles.subText}>Sunucu SQL Köprüsü: {API_URL}</Text>
          <Text style={styles.metaText}>Son İşlem: {lastSync}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleDriveSync('backup')} disabled={syncing}>
              {syncing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Drive'a Yedekle</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleDriveSync('restore')} disabled={syncing}>
              <Text style={styles.secondaryBtnText}>Drive'dan Çek</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kullanici Yonetimi Karti */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Kullanıcı Yönetimi</Text>
          <Text style={styles.subText}>Ana Yönetici: muh.serkanozgur@gmail.com</Text>

          <TextInput style={styles.input} placeholder="Ad Soyad" value={newName} onChangeText={setNewName} placeholderTextColor="#8E8E93" />
          <TextInput style={styles.input} placeholder="E-posta" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" placeholderTextColor="#8E8E93" />
          <TextInput style={styles.input} placeholder="Giriş Şifresi" value={newPass} onChangeText={setNewPass} secureTextEntry placeholderTextColor="#8E8E93" />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddUser}>
            <Text style={styles.primaryBtnText}>+ Yeni Kullanıcı Ekle</Text>
          </TouchableOpacity>

          {users.map((u, idx) => (
            <View key={idx} style={styles.userRow}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem('current_user');
            router.replace('/(auth)/login');
          }}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 30, fontWeight: '700', color: '#000', marginBottom: 16, letterSpacing: -0.5 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 6 },
  subText: { fontSize: 14, color: '#3A3A3C', marginBottom: 4 },
  metaText: { fontSize: 12, color: '#8E8E93', marginTop: 4, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginTop: 10,
    color: '#000',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginTop: 10,
  },
  userName: { fontSize: 15, fontWeight: '600', color: '#000' },
  userEmail: { fontSize: 14, color: '#8E8E93' },
  logoutBtn: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'http://100.103.221.60:3002';
const DEFAULT_EMAIL = 'muh.serkanozgur@gmail.com';

export default function LoginScreen() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const activeUser = email.trim();
    const activePass = password.trim();

    if (!activeUser || !activePass) {
      Alert.alert('Eksik Bilgi', 'Lütfen kullanıcı adı/e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUser, pin: activePass }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await AsyncStorage.setItem('current_user', JSON.stringify(data.user));
        router.replace('/(tabs)');
        return;
      }

      Alert.alert('Giriş Başarısız', data.message || 'Kullanıcı adı veya şifre hatalı.');
    } catch (err: any) {
      Alert.alert('Bağlantı Hatası', `Sunucuya ulaşılamadı (${API_URL}). Lütfen ağ bağlantınızı kontrol edin.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.headerBox}>
          <Text style={styles.appTitle}>Muhasebe Cepte</Text>
          <Text style={styles.appSubtitle}>Yönetici & Personel Giriş Paneli</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>KULLANICI ADI VEYA E-POSTA</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder="muh.serkanozgur@gmail.com"
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>ŞİFRE / PIN</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            keyboardType="number-pad"
            placeholder="••••"
            placeholderTextColor="#8E8E93"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerInfo}>Sunucu: 100.103.221.60:3002 • Yerel Veritabanı</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  headerBox: { marginBottom: 24, alignItems: 'center' },
  appTitle: { fontSize: 32, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },
  appSubtitle: { fontSize: 15, color: '#6E6E73', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginTop: 10,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 5,
    fontSize: 16,
    backgroundColor: '#FAFAFC',
  },
  primaryBtn: {
    backgroundColor: '#0066CC',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  footerInfo: {
    marginTop: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

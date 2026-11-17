import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'http://100.103.221.60:3001';
const ADMIN_EMAIL = 'muh.serkanozgur@gmail.com';
const ADMIN_PASS = '3797';

export default function LoginScreen() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (customPass?: string) => {
    const activeEmail = email.trim().toLowerCase();
    const activePass = (customPass ?? password).trim();

    if (!activeEmail || !activePass) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      // 1. Yerel kayitli kullanicilar veya varsayilan yonetici kontrolu
      const storedUsersRaw = await AsyncStorage.getItem('app_users');
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const matchedLocal = storedUsers.find(
        (u: any) => u.email.toLowerCase() === activeEmail && u.password === activePass
      );

      if ((activeEmail === ADMIN_EMAIL && activePass === ADMIN_PASS) || matchedLocal) {
        await AsyncStorage.setItem('current_user', JSON.stringify({
          email: activeEmail,
          name: activeEmail === ADMIN_EMAIL ? 'Serkan Özgür (Yönetici)' : matchedLocal.name,
          role: activeEmail === ADMIN_EMAIL ? 'admin' : 'user',
          apiUrl: API_URL,
          driveAccount: 'ubuntuserverclaude@gmail.com'
        }));
        router.replace('/(tabs)');
        return;
      }

      // 2. Sunucu API dogrulama denemesi
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, password: activePass })
      });
      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem('current_user', JSON.stringify(data.user || { email: activeEmail, role: 'user' }));
        router.replace('/(tabs)');
        return;
      }

      Alert.alert('Giriş Başarısız', 'E-posta veya şifre hatalı.');
    } catch {
      Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamadı. Yönetici bilgileriyle yerel giriş yapabilirsiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.headerBox}>
          <Text style={styles.appTitle}>Muhasebe Cepte</Text>
          <Text style={styles.appSubtitle}>Ön Muhasebe & Bulut Senkronizasyon</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>E-POSTA ADRESİ</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ornek@domain.com"
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>ŞİFRE</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            keyboardType="number-pad"
            placeholder="••••"
            placeholderTextColor="#8E8E93"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleLogin()} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Giriş Yap</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => {
              setEmail(ADMIN_EMAIL);
              setPassword(ADMIN_PASS);
              handleLogin(ADMIN_PASS);
            }}
          >
            <Text style={styles.quickBtnText}>⚡ Tek Tıkla Yönetici Girişi (Serkan Özgür)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerInfo}>Sunucu: 100.103.221.60:3001 • Drive: ubuntuserverclaude@gmail.com</Text>
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
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  quickBtn: {
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  quickBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  footerInfo: { textAlign: 'center', fontSize: 12, color: '#8E8E93', marginTop: 20 },
});

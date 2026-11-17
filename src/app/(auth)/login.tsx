import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://100.103.221.60:3001';
const ADMIN_EMAIL = 'muh.serkanozgur@gmail.com';
const ADMIN_PASS = '3797';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

export default function LoginScreen() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      fetchGoogleUser(response.authentication.accessToken);
    }
  }, [response]);

  const fetchGoogleUser = async (token: string) => {
    setLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gUser = await userInfoRes.json();
      const gEmail = (gUser.email || '').trim().toLowerCase();

      const storedUsersRaw = await AsyncStorage.getItem('app_users');
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const matchedLocal = storedUsers.find((u: any) => u.email.toLowerCase() === gEmail);

      if (gEmail === ADMIN_EMAIL || matchedLocal) {
        await AsyncStorage.setItem('current_user', JSON.stringify({
          email: gEmail,
          name: gEmail === ADMIN_EMAIL ? 'Serkan Özgür (Yönetici)' : (gUser.name || matchedLocal.name),
          role: gEmail === ADMIN_EMAIL ? 'admin' : 'user',
          apiUrl: API_URL,
          driveAccount: 'ubuntuserverclaude@gmail.com',
          authProvider: 'google',
        }));
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Yetkisiz Google Hesabı',
          `${gEmail} adresi sistemde kayıtlı değil. Lütfen yöneticinizden (muh.serkanozgur@gmail.com) yetki isteyin.`
        );
      }
    } catch {
      Alert.alert('Google Giriş Hatası', 'Google hesap bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (customPass?: string) => {
    const activeEmail = email.trim().toLowerCase();
    const activePass = (customPass ?? password).trim();

    if (!activeEmail || !activePass) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
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
          driveAccount: 'ubuntuserverclaude@gmail.com',
        }));
        router.replace('/(tabs)');
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, password: activePass }),
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
          <TouchableOpacity
            style={styles.googleBtn}
            disabled={!request || loading}
            onPress={() => promptAsync()}
          >
            <Text style={styles.googleBtnText}>G  Google ile Devam Et</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VEYA E-POSTA İLE</Text>
            <View style={styles.dividerLine} />
          </View>

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
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  googleBtnText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
  dividerText: { fontSize: 11, fontWeight: '600', color: '#8E8E93', marginHorizontal: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 6, marginTop: 8 },
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
    marginTop: 18,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  quickBtn: {
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  quickBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  footerInfo: { textAlign: 'center', fontSize: 12, color: '#8E8E93', marginTop: 20 },
});

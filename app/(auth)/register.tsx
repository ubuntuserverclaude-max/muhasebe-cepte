import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { theme } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { validateEmail } from '@/utils/validation';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Adınızı ve soyadınızı girin');
      return;
    }
    if (!companyName.trim()) {
      Alert.alert('Hata', 'Firma adını girin');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, companyName);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Muhasebe Cepte</Text>
      <Text style={styles.subtitle}>Kayıt Ol</Text>

      <TextInput
        label="Ad Soyad"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <TextInput
        label="Firma Adı"
        value={companyName}
        onChangeText={setCompanyName}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <TextInput
        label="E-posta"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <TextInput
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor={theme.colors.primary}
      >
        Kayıt Ol
      </Button>

      <Link href="/(auth)/login" style={styles.link}>
        <Text style={styles.linkText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  link: {
    marginTop: theme.spacing.lg,
  },
  linkText: {
    color: theme.colors.primary,
    textAlign: 'center',
    fontSize: 14,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { theme } from '@/config/theme';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>Kamera izni gereklidir.</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.btn}>
          İzin Ver
        </Button>
        <Button mode="outlined" onPress={() => router.back()} style={styles.btn}>
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : ({ data }) => {
          setScanned(true);
          // Barkod okutulduğunda önceki ekrana dönebilir veya ürün sorgulayabiliriz
          router.back();
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>Barkod / QR Kod Okutun</Text>
        <View style={styles.scannerBox} />
        <Button mode="contained" onPress={() => router.back()} style={styles.cancelBtn}>
          İptal
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  btn: {
    marginBottom: 10,
    width: 200,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 40,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3fb950',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cancelBtn: {
    marginBottom: 30,
    width: 200,
    backgroundColor: '#FF5A5F',
  },
});

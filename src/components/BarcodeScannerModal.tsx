import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({ visible, onClose, onScan }: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View style={styles.centerContainer}>
          <Text style={styles.text}>Kamera izni gereklidir.</Text>
          <Button title="İzin Ver" onPress={requestPermission} />
          <Button title="Kapat" onPress={onClose} color="#666" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onShow={() => setScanned(false)}
    >
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={scanned ? undefined : ({ data }) => {
            setScanned(true);
            onScan(data);
            onClose();
          }}
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>Barkod / QR Kod Okutun</Text>
          <View style={styles.scannerBox} />
          <View style={styles.buttonContainer}>
            <Button title="İptal Et" onPress={onClose} color="#FF5A5F" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
    marginTop: 20,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3fb950',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
});

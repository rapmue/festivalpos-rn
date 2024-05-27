import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProducts } from '../services/api';
import { Camera, CameraView } from 'expo-camera'; // Import Camera for permissions

// Import custom colors
import { Colors } from '../constants/Colors';

const SettingsScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    loadUrl();
    requestCameraPermission();
  }, []);

  const loadUrl = async () => {
    const savedUrl = await AsyncStorage.getItem('productUrl');
    if (savedUrl) {
      setUrl(savedUrl);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const saveUrl = async () => {
    await AsyncStorage.setItem('productUrl', url);
    Alert.alert('Success', 'URL saved successfully');
  };

  const fetchNewData = async () => {
    const products = await fetchProducts();
    navigation.navigate('POS', { products });
  };

  const handleBarCodeScanned = (data) => {
    setUrl(data.data);
    setIsScannerOpen(false);
    Alert.alert('Scan successful!', `URL has been set to: ${data.data}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.box}>
        <Pressable style={styles.button} onPress={() => setIsScannerOpen(true)}>
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={fetchNewData}>
          <Text style={styles.buttonText}>Refresh Products</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter URL"
        placeholderTextColor={Colors.icon}
        value={url}
        onChangeText={setUrl}
      />
      <Pressable style={styles.button} onPress={saveUrl}>
        <Text style={styles.buttonText}>Save URL</Text>
      </Pressable>
      
      {isScannerOpen && hasPermission && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isScannerOpen}
          onRequestClose={() => {
            setIsScannerOpen(!isScannerOpen);
          }}
        >
          <View style={styles.modalView}>
            <CameraView
              style={styles.camera}
              facing='back'
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            >
              <View style={styles.cameraContent}>
                <Pressable style={styles.button} onPress={() => setIsScannerOpen(false)}>
                  <Text style={styles.buttonText}>Close Scanner</Text>
                </Pressable>
                <Pressable style={styles.button}>
                  <Text style={styles.buttonText}>Flip Cam</Text>
                </Pressable>
              </View>
            </CameraView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    color: Colors.text,
    marginBottom: 20,
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: 300,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.icon,
    padding: 10,
    color: Colors.text,
  },
  camera: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContent: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: Colors.tint,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.background,
    textAlign: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
});

export default SettingsScreen;
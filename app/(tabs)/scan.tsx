import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Button from '@/components/ui/Button';
import { RefreshCw, Upload, CheckCircle, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import polygonIdStore from '@/store/polygon-id-store';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function ScanScreen() {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const { processQRCode, isLoading } = polygonIdStore();
  
  const lastScanTime = useRef<number>(0);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const validatePolygonIdQR = (data: string): boolean => {
    try {
      // Check if it's a URL format
      if (data.startsWith('https://') || data.startsWith('http://')) {
        return data.includes('iden3-communication.io') || 
               data.includes('authorization') ||
               data.includes('polygon');
      }
      
      // Check if it's JSON format
      const parsed = JSON.parse(data);
      return (
        parsed.typ === 'application/iden3comm-plain-json' &&
        (parsed.type?.includes('auth-request') || 
         parsed.type?.includes('authorization') ||
         parsed.type?.includes('https://iden3-communication.io/authorization/1.0/request'))
      );
    } catch {
      return false;
    }
  };
  
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    const now = Date.now();
    
    // Prevent rapid scanning (debounce for 2 seconds)
    if (now - lastScanTime.current < 2000) {
      return;
    }
    
    // Prevent duplicate scans of the same QR code
    if (processing || data === lastScanned) {
      return;
    }
    
    lastScanTime.current = now;
    setLastScanned(data);
    setProcessing(true);
    setScanning(false); // Stop scanning while processing
    
    // Clear any existing timeout
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    
    try {
      console.log('Processing QR code:', {
        length: data.length,
        isUrl: data.startsWith('http'),
        preview: data.substring(0, 100) + '...'
      });
      
      // Validate QR code format
      if (!validatePolygonIdQR(data)) {
        setScanResult('error');
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid EchoID ID verification request. Please scan a QR code from a EchoID ID verifier.',
          [
            {
              text: 'Try Again',
              onPress: () => resetScan(),
            },
          ]
        );
        return;
      }
      
      // Process the QR code
      const verificationRequest = await processQRCode(data);
      
      setScanResult('success');
      Alert.alert(
        'Verification Request Received',
        `${verificationRequest.requester.name} is requesting ${verificationRequest.purpose}. Check your notifications to respond.`,
        [
          {
            text: 'View Request',
            onPress: () => {
              resetScan();
            },
          },
          {
            text: 'Scan Another',
            onPress: () => resetScan(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to process QR code:', error);
      setScanResult('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Invalid') || errorMessage.includes('format')) {
        Alert.alert(
          'Invalid QR Code Format',
          'This QR code is not in the correct Polygon ID format. Please scan a QR code from an official Polygon ID verifier.',
          [{ text: 'Try Again', onPress: () => resetScan() }]
        );
      } else {
        Alert.alert(
          'Processing Error',
          'There was an error processing the QR code. Please try again or check your internet connection.',
          [{ text: 'Try Again', onPress: () => resetScan() }]
        );
      }
    } finally {
      setProcessing(false);
      
      scanTimeout.current = setTimeout(() => {
        resetScan();
      }, 3000);
    }
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      Alert.alert(
        'Image Upload',
        'QR code extraction from images is not yet implemented. Please use the camera to scan QR codes directly.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const resetScan = () => {
    setScanning(true);
    setProcessing(false);
    setLastScanned(null);
    setScanResult(null);
    
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
  };
  
  const getStatusIcon = () => {
    if (processing) {
      return <RefreshCw size={32} color={theme.colors[colorMode].warning} />;
    }
    if (scanResult === 'success') {
      return <CheckCircle size={32} color={theme.colors[colorMode].success} />;
    }
    if (scanResult === 'error') {
      return <AlertCircle size={32} color={theme.colors[colorMode].error} />;
    }
    return null;
  };
  
  const getStatusText = () => {
    if (processing) {
      return 'Processing verification request...';
    }
    if (scanResult === 'success') {
      return 'Verification request received successfully!';
    }
    if (scanResult === 'error') {
      return 'Invalid QR code format';
    }
    return 'Scan a Polygon ID verification QR code';
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors[colorMode].background,
    },
    cameraContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    camera: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanFrame: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: processing 
        ? theme.colors[colorMode].warning 
        : scanResult === 'success' 
          ? theme.colors[colorMode].success
          : scanResult === 'error'
            ? theme.colors[colorMode].error
            : theme.colors[colorMode].primary,
      backgroundColor: 'transparent',
      marginBottom: 20,
      borderRadius: 12,
    },
    scanText: {
      color: '#ffffff',
      textAlign: 'center',
      paddingHorizontal: 40,
      fontSize: 16,
    },
    statusContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    controls: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: theme.colors[colorMode].card,
      borderTopWidth: 1,
      borderTopColor: theme.colors[colorMode].border,
    },
    controlButton: {
      flex: 1,
      marginHorizontal: 8,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    permissionText: {
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 40,
      color: theme.colors[colorMode].text,
      fontSize: 16,
    },
    permissionButton: {
      minWidth: 200,
    },
    webFallback: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors[colorMode].background,
      padding: 20,
    },
    webFallbackText: {
      color: theme.colors[colorMode].text,
      textAlign: 'center',
      fontSize: 16,
      maxWidth: 300,
      marginBottom: 20,
    },
    infoText: {
      color: '#ffffff',
      textAlign: 'center',
      paddingHorizontal: 20,
      fontSize: 14,
      marginTop: 10,
      opacity: 0.8,
    },
  });
  
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Stack.Screen options={{ title: 'Scan QR Code' }} />
        <Text style={styles.permissionText}>Requesting camera permissions...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Stack.Screen options={{ title: 'Scan QR Code' }} />
        <Text style={styles.permissionText}>
          We need your permission to use the camera to scan Polygon ID verification requests.
        </Text>
        <Button 
          title="Grant Permission" 
          onPress={requestPermission} 
          style={styles.permissionButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Scan Verification Request' }} />
      
      <View style={styles.cameraContainer}>
        {Platform.OS !== 'web' || (Platform.OS === 'web' && permission.granted) ? (
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              
              <View style={styles.statusContainer}>
                {getStatusIcon()}
                <Text style={styles.scanText}>
                  {getStatusText()}
                </Text>
              </View>
              
              <Text style={styles.infoText}>
                Position the QR code within the frame{'\n'}
                Compatible with Polygon ID verifiers
              </Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>
              Camera access is limited in web browsers. Please use the mobile app for QR code scanning.
            </Text>
            <Button
              title="Upload QR Image"
              variant="outline"
              onPress={handlePickImage}
              leftIcon={<Upload size={16} color={theme.colors[colorMode].primary} />}
            />
          </View>
        )}
      </View>
      
      <View style={styles.controls}>
        <Button
          title="Flip Camera"
          variant="outline"
          onPress={toggleCameraFacing}
          style={styles.controlButton}
          disabled={processing || isLoading}
        />
        <Button
          title="Reset Scan"
          variant="outline"
          onPress={resetScan}
          style={styles.controlButton}
          leftIcon={<RefreshCw size={16} color={theme.colors[colorMode].primary} />}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
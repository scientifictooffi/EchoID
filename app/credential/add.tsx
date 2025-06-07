import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import polygonIdStore from '@/store/polygon-id-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Camera, QrCode, Award, Plus } from 'lucide-react-native';
import { mockCredentials } from '@/mocks/credentials';
import * as Haptics from 'expo-haptics';

export default function AddCredentialScreen() {
  const router = useRouter();
  const { addCredential } = polygonIdStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleScanQR = () => {
    router.push('/scan');
  };
  
  const handleAddMockCredential = async (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    setIsLoading(true);
    
    try {
      const credential = {
        ...mockCredentials[index],
        id: `urn:uuid:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      };
      
      await addCredential(credential);
      router.back();
    } catch (error) {
      console.error('Failed to add credential:', error);
      Alert.alert('Error', 'Failed to add credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add Credential' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Scan Credential</Text>
        <Card style={styles.scanCard}>
          <View style={styles.scanContent}>
            <View style={styles.iconContainer}>
              <QrCode size={32} color={theme.colors.light.primary} />
            </View>
            <Text style={styles.scanTitle}>Scan QR Code</Text>
            <Text style={styles.scanDescription}>
              Scan a QR code from an issuer to add a new credential to your wallet.
            </Text>
            <Button
              title="Scan QR Code"
              onPress={handleScanQR}
              leftIcon={<Camera size={18} color="#ffffff" />}
              style={styles.scanButton}
            />
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Enter Manually</Text>
        <Card variant="outlined" style={styles.manualCard}>
          <Input
            label="Credential JSON"
            placeholder="Paste credential JSON here..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={styles.jsonInput}
          />
          <Button
            title="Add Credential"
            variant="outline"
            style={styles.addButton}
            isLoading={isLoading}
            disabled={isLoading}
            onPress={() => {
              Alert.alert('Manual Entry', 'In a real app, this would validate and add the credential from JSON.');
            }}
          />
        </Card>
        
        <Text style={styles.sectionTitle}>Demo Credentials</Text>
        <Text style={styles.demoDescription}>
          For demonstration purposes, you can add these sample credentials:
        </Text>
        
        {mockCredentials.slice(3).map((credential, index) => {
          // Get the main credential type (excluding the VerifiableCredential base type)
          const mainType = credential.type.find(type => type !== 'VerifiableCredential') || 'Unknown Credential';
          
          return (
            <TouchableOpacity
              key={credential.id}
              style={styles.demoCredential}
              onPress={() => handleAddMockCredential(index + 3)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <View style={styles.demoCredentialIcon}>
                <Award size={20} color={theme.colors.light.primary} />
              </View>
              <View style={styles.demoCredentialContent}>
                <Text style={styles.demoCredentialTitle}>{mainType}</Text>
                <Text style={styles.demoCredentialIssuer} numberOfLines={1} ellipsizeMode="middle">
                  {credential.issuer}
                </Text>
              </View>
              <View style={styles.addIconContainer}>
                <Plus size={18} color={theme.colors.light.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: theme.colors.light.text,
  },
  scanCard: {
    marginBottom: 24,
  },
  scanContent: {
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  scanDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.light.tabIconDefault,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scanButton: {
    minWidth: 200,
  },
  manualCard: {
    marginBottom: 24,
  },
  jsonInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
    marginBottom: 16,
  },
  demoCredential: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  demoCredentialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoCredentialContent: {
    flex: 1,
  },
  demoCredentialTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  demoCredentialIssuer: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
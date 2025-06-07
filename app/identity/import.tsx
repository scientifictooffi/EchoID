import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import polygonIdStore from '@/store/polygon-id-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Key, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ImportIdentityScreen() {
  const router = useRouter();
  const { importIdentity, isLoading } = polygonIdStore();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  
  const handleImport = async () => {
    if (!seedPhrase.trim()) {
      setError('Please enter your recovery phrase');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    try {
      await importIdentity(seedPhrase);
      router.replace('/');
    } catch (error) {
      console.error('Failed to import identity:', error);
      setError('Failed to import identity. Please check your recovery phrase and try again.');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Import Identity' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Key size={32} color={theme.colors.light.primary} />
          </View>
          <Text style={styles.headerTitle}>Import Existing Identity</Text>
          <Text style={styles.headerDescription}>
            Enter your recovery phrase to restore your PolygonID identity and access your credentials.
          </Text>
        </Card>
        
        <Card variant="outlined" style={styles.formCard}>
          <Input
            label="Recovery Phrase"
            placeholder="Enter your recovery phrase"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={seedPhrase}
            onChangeText={(text) => {
              setSeedPhrase(text);
              if (error) setError('');
            }}
            error={error}
            style={styles.seedInput}
          />
          
          <View style={styles.infoContainer}>
            <AlertCircle size={16} color={theme.colors.light.warning} />
            <Text style={styles.infoText}>
              Keep your recovery phrase secure. Anyone with access to it can control your identity.
            </Text>
          </View>
          
          <Button
            title="Import Identity"
            onPress={handleImport}
            isLoading={isLoading}
            disabled={isLoading || !seedPhrase.trim()}
            style={styles.importButton}
          />
        </Card>
        
        <Text style={styles.demoNote}>
          For demonstration purposes, you can enter any text as a recovery phrase.
        </Text>
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
    flexGrow: 1,
  },
  headerCard: {
    marginBottom: 24,
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  headerDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: theme.colors.light.tabIconDefault,
    paddingHorizontal: 16,
  },
  formCard: {
    marginBottom: 16,
  },
  seedInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.light.warning}15`,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  importButton: {
    marginTop: 8,
  },
  demoNote: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 16,
  },
});
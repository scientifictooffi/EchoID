import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import polygonIdStore from '@/store/polygon-id-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, Clock, Award, AlertCircle, Trash2, Share2, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export default function CredentialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { identity, removeCredential } = polygonIdStore();
  
  if (!identity) {
    router.replace('/');
    return null;
  }
  
  const credential = identity.credentials.find(cred => cred.id === id);
  
  if (!credential) {
    router.back();
    return null;
  }
  
  // Get the main credential type (excluding the VerifiableCredential base type)
  const mainType = credential.type.find(type => type !== 'VerifiableCredential') || 'Unknown Credential';
  
  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Check if credential is expired
  const isExpired = () => {
    if (!credential.expirationDate) return false;
    return new Date(credential.expirationDate) < new Date();
  };
  
  const handleShare = () => {
    // In a real app, this would share the credential
    Alert.alert('Share Credential', 'Sharing functionality would be implemented here.');
  };
  
  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCredential(credential.id);
              router.back();
            } catch (error) {
              console.error('Failed to delete credential:', error);
              Alert.alert('Error', 'Failed to delete credential. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const handleCopyValue = async (value: string) => {
    await Clipboard.setStringAsync(value);
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Copied', 'Value copied to clipboard');
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: mainType,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share2 size={22} color={theme.colors.light.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Award size={32} color={theme.colors.light.primary} />
            </View>
            
            <Text style={styles.credentialType}>{mainType}</Text>
            
            {isExpired() && (
              <View style={styles.expiredBadge}>
                <AlertCircle size={16} color="#ffffff" />
                <Text style={styles.expiredText}>Expired</Text>
              </View>
            )}
          </View>
        </Card>
        
        <Text style={styles.sectionTitle}>Credential Details</Text>
        <Card variant="outlined" style={styles.detailsCard}>
          {Object.entries(credential.credentialSubject).map(([key, value]) => {
            if (key === 'id') return null;
            
            return (
              <TouchableOpacity 
                key={key} 
                style={styles.detailItem}
                onPress={() => handleCopyValue(String(value))}
                activeOpacity={0.7}
              >
                <Text style={styles.detailLabel}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={styles.detailValue}>{String(value)}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>
        
        <Text style={styles.sectionTitle}>Issuance Information</Text>
        <Card variant="outlined" style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Issuer</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {credential.issuer}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.dateContainer}>
              <Calendar size={16} color={theme.colors.light.tabIconDefault} />
              <Text style={styles.dateLabel}>Issued Date</Text>
            </View>
            <Text style={styles.detailValue}>{formatDate(credential.issuanceDate)}</Text>
          </View>
          
          {credential.expirationDate && (
            <View style={styles.detailItem}>
              <View style={styles.dateContainer}>
                <Clock 
                  size={16} 
                  color={isExpired() ? theme.colors.light.error : theme.colors.light.tabIconDefault} 
                />
                <Text 
                  style={[
                    styles.dateLabel, 
                    isExpired() && { color: theme.colors.light.error }
                  ]}
                >
                  Expiration Date
                </Text>
              </View>
              <Text 
                style={[
                  styles.detailValue, 
                  isExpired() && { color: theme.colors.light.error }
                ]}
              >
                {formatDate(credential.expirationDate)}
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.actionsContainer}>
          <Button
            title="View on Blockchain"
            variant="outline"
            leftIcon={<ExternalLink size={16} color={theme.colors.light.primary} />}
            style={styles.actionButton}
            onPress={() => {
              // In a real app, this would open a blockchain explorer
              Alert.alert('Blockchain Explorer', 'This would open a blockchain explorer to view the credential.');
            }}
          />
          
          <Button
            title="Delete Credential"
            variant="outline"
            leftIcon={<Trash2 size={16} color={theme.colors.light.error} />}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
            onPress={handleDelete}
          />
        </View>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCard: {
    marginBottom: 24,
  },
  headerContent: {
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
  credentialType: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.light.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  expiredText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: theme.colors.light.text,
  },
  detailsCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  detailItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.light.text,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
    marginLeft: 8,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: theme.colors.light.error,
  },
  deleteButtonText: {
    color: theme.colors.light.error,
  },
});
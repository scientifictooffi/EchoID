import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Credential } from '@/types/polygon-id';
import Card from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { Calendar, Clock, Award, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ui/ThemeProvider';

interface CredentialCardProps {
  credential: Credential;
  onPress?: () => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onPress }) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const mainType = credential.type.find(type => type !== 'VerifiableCredential') || 'Unknown Credential';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const isExpired = () => {
    if (!credential.expirationDate) return false;
    return new Date(credential.expirationDate) < new Date();
  };
  
  const getCredentialFields = () => {
    const { id, ...fields } = credential.credentialSubject;
    return Object.entries(fields).slice(0, 3); 
  };

  const styles = StyleSheet.create({
    card: {
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    type: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
      color: theme.colors[colorMode].text,
    },
    expiredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors[colorMode].error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    expiredText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors[colorMode].border,
      marginBottom: 12,
    },
    content: {
      marginBottom: 12,
    },
    field: {
      marginBottom: 8,
    },
    fieldName: {
      fontSize: 14,
      color: theme.colors[colorMode].tabIconDefault,
      marginBottom: 2,
    },
    fieldValue: {
      fontSize: 16,
      color: theme.colors[colorMode].text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: theme.colors[colorMode].tabIconDefault,
      marginLeft: 4,
    },
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Award size={20} color={theme.colors[colorMode].primary} />
            <Text style={styles.type}>{mainType}</Text>
          </View>
          
          {isExpired() && (
            <View style={styles.expiredBadge}>
              <AlertCircle size={14} color="#ffffff" />
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.content}>
          {getCredentialFields().map(([key, value]) => (
            <View key={key} style={styles.field}>
              <Text style={styles.fieldName}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
              <Text style={styles.fieldValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={theme.colors[colorMode].tabIconDefault} />
            <Text style={styles.dateText}>Issued: {formatDate(credential.issuanceDate)}</Text>
          </View>
          
          {credential.expirationDate && (
            <View style={styles.dateContainer}>
              <Clock size={14} color={isExpired() ? theme.colors[colorMode].error : theme.colors[colorMode].tabIconDefault} />
              <Text style={[
                styles.dateText, 
                isExpired() && { color: theme.colors[colorMode].error }
              ]}>
                Expires: {formatDate(credential.expirationDate)}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default CredentialCard;
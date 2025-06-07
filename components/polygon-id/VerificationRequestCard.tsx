import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerificationRequest } from '@/types/polygon-id';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { Image } from 'expo-image';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ui/ThemeProvider';

interface VerificationRequestCardProps {
  request: VerificationRequest;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const VerificationRequestCard: React.FC<VerificationRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const getStatusColor = () => {
    switch (request.status) {
      case 'approved':
        return theme.colors[colorMode].success;
      case 'rejected':
        return theme.colors[colorMode].error;
      default:
        return theme.colors[colorMode].warning;
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'approved':
        return <CheckCircle size={16} color={theme.colors[colorMode].success} />;
      case 'rejected':
        return <XCircle size={16} color={theme.colors[colorMode].error} />;
      default:
        return <Clock size={16} color={theme.colors[colorMode].warning} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    requesterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    requesterLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    requesterLogoFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors[colorMode].primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    requesterLogoInitial: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
    },
    requesterInfo: {
      marginLeft: 12,
      flex: 1,
    },
    requesterName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors[colorMode].text,
    },
    requesterDid: {
      fontSize: 12,
      color: theme.colors[colorMode].tabIconDefault,
      maxWidth: '90%',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
    },
    statusText: {
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
      marginBottom: 16,
    },
    purposeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors[colorMode].text,
      marginBottom: 4,
    },
    purposeText: {
      fontSize: 14,
      color: theme.colors[colorMode].text,
      marginBottom: 12,
    },
    credentialsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors[colorMode].text,
      marginBottom: 8,
    },
    credentialItem: {
      marginBottom: 8,
    },
    credentialType: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors[colorMode].text,
      marginBottom: 4,
    },
    fieldsList: {
      paddingLeft: 8,
    },
    fieldItem: {
      fontSize: 14,
      color: theme.colors[colorMode].tabIconDefault,
      marginBottom: 2,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors[colorMode].tabIconDefault,
      marginTop: 8,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    rejectButton: {
      marginRight: 12,
      flex: 1,
    },
    approveButton: {
      flex: 1,
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.requesterContainer}>
          {request.requester.logo ? (
            <Image
              source={{ uri: request.requester.logo }}
              style={styles.requesterLogo}
              contentFit="cover"
            />
          ) : (
            <View style={styles.requesterLogoFallback}>
              <Text style={styles.requesterLogoInitial}>
                {request.requester.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.requesterInfo}>
            <Text style={styles.requesterName}>{request.requester.name}</Text>
            <Text style={styles.requesterDid} numberOfLines={1} ellipsizeMode="middle">
              {request.requester.did}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.content}>
        <Text style={styles.purposeLabel}>Purpose:</Text>
        <Text style={styles.purposeText}>{request.purpose}</Text>
        
        <Text style={styles.credentialsLabel}>Requested Credentials:</Text>
        {request.requestedCredentials.map((cred, index) => (
          <View key={index} style={styles.credentialItem}>
            <Text style={styles.credentialType}>{cred.type}</Text>
            <View style={styles.fieldsList}>
              {cred.requiredFields.map((field, fieldIndex) => (
                <Text key={fieldIndex} style={styles.fieldItem}>• {field}</Text>
              ))}
            </View>
          </View>
        ))}
        
        <Text style={styles.dateText}>
          Requested on {formatDate(request.createdAt)}
        </Text>
      </View>
      
      {request.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Reject"
            variant="outline"
            onPress={onReject}
            style={styles.rejectButton}
            isLoading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Approve"
            onPress={onApprove}
            style={styles.approveButton}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </View>
      )}
    </Card>
  );
};

export default VerificationRequestCard;
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import polygonIdStoreReal from '@/store/polygon-id-store-real';
import VerificationRequestCard from '@/components/polygon-id/VerificationRequestCard';
import ZKProofGenerator from '@/components/polygon-id/ZKProofGenerator';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/components/ui/ThemeProvider';

export default function NotificationsRealScreen() {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  const { verificationRequests, handleVerificationRequest } = polygonIdStoreReal();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showProofGenerator, setShowProofGenerator] = useState<string | null>(null);
  
  const handleApprove = async (requestId: string) => {
    const request = verificationRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // Show ZK proof generator for real proof generation
    setShowProofGenerator(requestId);
  };
  
  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await handleVerificationRequest(requestId, false);
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleProofGenerated = async (requestId: string, success: boolean) => {
    setShowProofGenerator(null);
    
    if (success) {
      setProcessingId(requestId);
      try {
        await handleVerificationRequest(requestId, true);
      } catch (error) {
        console.error('Failed to approve request:', error);
      } finally {
        setProcessingId(null);
      }
    }
  };
  
  const pendingRequests = verificationRequests.filter(req => req.status === 'pending');
  const pastRequests = verificationRequests.filter(req => req.status !== 'pending');
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors[colorMode].background,
    },
    scrollContent: {
      padding: 16,
      flexGrow: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.colors[colorMode].text,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
      color: theme.colors[colorMode].text,
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.colors[colorMode].tabIconDefault,
      maxWidth: 300,
    },
  });
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verification Requests' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pendingRequests.length === 0 && pastRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors[colorMode].tabIconDefault} />
            <Text style={styles.emptyStateTitle}>No Verification Requests</Text>
            <Text style={styles.emptyStateText}>
              When you scan a PolygonID verification QR code, the requests will appear here.
            </Text>
          </View>
        ) : (
          <>
            {pendingRequests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pending Requests</Text>
                {pendingRequests.map(request => (
                  <View key={request.id}>
                    <VerificationRequestCard
                      request={request}
                      onApprove={() => handleApprove(request.id)}
                      onReject={() => handleReject(request.id)}
                      isLoading={processingId === request.id}
                    />
                    
                    {showProofGenerator === request.id && (
                      <ZKProofGenerator
                        request={request}
                        onProofGenerated={(success) => handleProofGenerated(request.id, success)}
                      />
                    )}
                  </View>
                ))}
              </>
            )}
            
            {pastRequests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Completed Requests</Text>
                {pastRequests.map(request => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
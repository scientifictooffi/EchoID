import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import polygonIdStore from "@/store/polygon-id-store";
import IdentityHeader from "@/components/polygon-id/IdentityHeader";
import CredentialCard from "@/components/polygon-id/CredentialCard";
import Button from "@/components/ui/Button";
import { Plus, RefreshCw } from "lucide-react-native";
import { mockCredentials } from "@/mocks/credentials";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function IdentityScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? "dark" : "light";
  const { identity, isInitialized, isLoading, createIdentity, addCredential } =
    polygonIdStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const addMockCredentials = async () => {
      if (identity && identity.credentials.length === 0) {
        for (const credential of mockCredentials.slice(0, 3)) {
          await addCredential(credential);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    };

    if (identity) {
      addMockCredentials();
    }
  }, [identity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleCreateIdentity = async () => {
    try {
      await createIdentity("My EchoID");
    } catch (error) {
      console.error("Failed to create identity:", error);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleCredentialPress = (credentialId: string) => {
    router.push({
      pathname: "/credential/[id]",
      params: { id: credentialId },
    });
  };

  const handleAddCredential = () => {
    router.push("/credential/add");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors[colorMode].background,
    },
    scrollContent: {
      padding: 16,
    },
    welcomeContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 16,
      color: theme.colors[colorMode].text,
      textAlign: "center",
    },
    welcomeDescription: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      color: theme.colors[colorMode].tabIconDefault,
    },
    createButton: {
      width: "100%",
      marginBottom: 16,
    },
    importButton: {
      padding: 12,
    },
    importButtonText: {
      color: theme.colors[colorMode].primary,
      fontWeight: "600",
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors[colorMode].background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors[colorMode].tabIconDefault,
    },
    credentialsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors[colorMode].text,
    },
    addButton: {
      padding: 8,
    },
    emptyState: {
      backgroundColor: theme.colors[colorMode].card,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
      alignItems: "center",
      ...theme.shadows.sm,
    },
    emptyStateText: {
      textAlign: "center",
      marginBottom: 16,
      color: theme.colors[colorMode].tabIconDefault,
      fontSize: 16,
    },
    emptyStateButton: {
      minWidth: 200,
    },
    refreshButton: {
      padding: 8,
      marginRight: 8,
    },
    rotating: {
      transform: [{ rotate: "45deg" }],
    },
  });

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "EchoID Wallet" }} />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to EchoID</Text>
          <Text style={styles.welcomeDescription}>
            Your secure digital identity wallet powered by blockchain
            technology. Create or import your decentralized identity to get
            started.
          </Text>
          
          <Button
            title="Create New Identity"
            onPress={handleCreateIdentity}
            isLoading={isLoading}
            style={styles.createButton}
          />
          
          <TouchableOpacity
            onPress={() => router.push("/identity/import")}
            style={styles.importButton}
            activeOpacity={0.7}
          >
            <Text style={styles.importButtonText}>
              Import Existing Identity
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!identity) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors[colorMode].primary}
        />
        <Text style={styles.loadingText}>Loading identity...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "EchoID Wallet",
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleRefresh}
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <RefreshCw 
                size={20} 
                color={theme.colors[colorMode].primary}
                style={refreshing ? styles.rotating : undefined}
              />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors[colorMode].primary]}
            tintColor={theme.colors[colorMode].primary}
          />
        }
      >
        <IdentityHeader identity={identity} onEditProfile={handleEditProfile} />
        
        <View style={styles.credentialsHeader}>
          <Text style={styles.sectionTitle}>Your Credentials</Text>
          <TouchableOpacity
            onPress={handleAddCredential}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Plus size={20} color={theme.colors[colorMode].primary} />
          </TouchableOpacity>
        </View>
        
        {identity.credentials.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any credentials yet. Add your first credential to
              get started.
            </Text>
            <Button
              title="Add Credential"
              onPress={handleAddCredential}
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          identity.credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onPress={() => handleCredentialPress(credential.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

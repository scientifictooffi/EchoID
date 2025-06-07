import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import polygonIdStore from "@/store/polygon-id-store";
import Card from "@/components/ui/Card";
import {
  Shield,
  Key,
  Bell,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Trash2,
  Moon,
  Sun,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { identity } = polygonIdStore();
  const { isDarkMode, toggleTheme } = useTheme();
  const colorMode = isDarkMode ? "dark" : "light";

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleToggleBiometrics = () => {
    setBiometricsEnabled(!biometricsEnabled);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleDeleteIdentity = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      "Delete Identity",
      "Are you sure you want to delete your identity? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, this would delete the identity
            polygonIdStore.setState({
              identity: null,
              isInitialized: false,
              verificationRequests: [],
            });
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors[colorMode].background,
    },
    scrollContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
      marginTop: 16,
      color: theme.colors[colorMode].text,
    },
    card: {
      marginBottom: 16,
      padding: 0,
      overflow: "hidden",
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors[colorMode].primary}15`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 4,
      color: theme.colors[colorMode].text,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors[colorMode].tabIconDefault,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors[colorMode].border,
      marginLeft: 56,
    },
    dangerItem: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors[colorMode].error,
    },
    dangerIcon: {
      backgroundColor: `${theme.colors[colorMode].error}15`,
    },
    dangerText: {
      color: theme.colors[colorMode].error,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Settings" }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              {isDarkMode ? (
                <Moon size={20} color={theme.colors[colorMode].primary} />
              ) : (
                <Sun size={20} color={theme.colors[colorMode].primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                {isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleTheme}
              trackColor={{
                false: "#e2e8f0",
                true: `${theme.colors[colorMode].primary}80`,
              }}
              thumbColor={
                isDarkMode ? theme.colors[colorMode].primary : "#f4f4f5"
              }
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Security</Text>
        <Card variant="outlined" style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/settings/backup")}
          >
            <View style={styles.settingIcon}>
              <Key size={20} color={theme.colors[colorMode].primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Backup Recovery Phrase</Text>
              <Text style={styles.settingDescription}>
                Secure your identity with a backup
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors[colorMode].tabIconDefault}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Shield size={20} color={theme.colors[colorMode].primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Use Face ID or fingerprint to unlock
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{
                false: "#e2e8f0",
                true: `${theme.colors[colorMode].primary}80`,
              }}
              thumbColor={
                biometricsEnabled ? theme.colors[colorMode].primary : "#f4f4f5"
              }
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={20} color={theme.colors[colorMode].primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive alerts for verification requests
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{
                false: "#e2e8f0",
                true: `${theme.colors[colorMode].primary}80`,
              }}
              thumbColor={
                notificationsEnabled
                  ? theme.colors[colorMode].primary
                  : "#f4f4f5"
              }
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Support</Text>
        <Card variant="outlined" style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/scan")}
          >
            <View style={styles.settingIcon}>
              <HelpCircle size={20} color={theme.colors[colorMode].primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Scan a Verification QR Code
              </Text>
              <Text style={styles.settingDescription}>
                Scan QR codes for identity verification
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors[colorMode].tabIconDefault}
            />
          </TouchableOpacity>
        </Card>

        {identity && (
          <>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card variant="outlined" style={styles.card}>
              <TouchableOpacity
                style={[styles.settingItem, styles.dangerItem]}
                onPress={handleDeleteIdentity}
              >
                <View style={styles.settingIcon}>
                  <Trash2 size={20} color={theme.colors[colorMode].error} />
                </View>
                <View style={styles.settingContent}>
                  <Text
                    style={[
                      styles.settingTitle,
                      { color: theme.colors[colorMode].error },
                    ]}
                  >
                    Delete Identity
                  </Text>
                  <Text style={styles.settingDescription}>
                    Permanently delete your identity
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={theme.colors[colorMode].tabIconDefault}
                />
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { theme } from "@/constants/theme";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Shield, Copy, Eye, EyeOff } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

export default function BackupScreen() {
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a mock recovery phrase
  const recoveryPhrase =
    "polygon identity wallet secure blockchain decentralized verification credentials trust";

  const handleToggleShow = () => {
    if (!showRecoveryPhrase) {
      Alert.alert(
        "Security Warning",
        "Make sure no one is watching your screen. Never share your recovery phrase with anyone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Show Phrase",
            onPress: () => setShowRecoveryPhrase(true),
          },
        ]
      );
    } else {
      setShowRecoveryPhrase(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(recoveryPhrase);
    setCopied(true);

    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Backup Recovery Phrase" }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Shield size={32} color={theme.colors.light.primary} />
          </View>
          <Text style={styles.headerTitle}>Recovery Phrase</Text>
          <Text style={styles.headerDescription}>
            Your recovery phrase is the only way to restore your identity if you
            lose access to your device. Write it down and keep it in a safe
            place.
          </Text>
        </Card>

        <Card variant="outlined" style={styles.phraseCard}>
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>IMPORTANT</Text>
            <Text style={styles.warningText}>
              • Never share your recovery phrase with anyone
            </Text>
            <Text style={styles.warningText}>
              • EchoID will never ask for your recovery phrase
            </Text>
            <Text style={styles.warningText}>
              • Store it in a secure location offline
            </Text>
          </View>

          <TouchableOpacity
            style={styles.phraseContainer}
            onPress={handleToggleShow}
            activeOpacity={0.7}
          >
            {showRecoveryPhrase ? (
              <Text style={styles.phraseText}>{recoveryPhrase}</Text>
            ) : (
              <Text style={styles.hiddenText}>
                ••••• ••••• ••••• ••••• ••••• ••••• ••••• •••••
              </Text>
            )}

            <TouchableOpacity
              style={styles.visibilityButton}
              onPress={handleToggleShow}
              activeOpacity={0.7}
            >
              {showRecoveryPhrase ? (
                <EyeOff size={20} color={theme.colors.light.tabIconDefault} />
              ) : (
                <Eye size={20} color={theme.colors.light.tabIconDefault} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          <Button
            title={copied ? "Copied!" : "Copy to Clipboard"}
            variant="outline"
            leftIcon={<Copy size={16} color={theme.colors.light.primary} />}
            onPress={handleCopy}
            style={styles.copyButton}
          />
        </Card>

        <Card style={styles.verifyCard}>
          <Text style={styles.verifyTitle}>Verify Your Backup</Text>
          <Text style={styles.verifyDescription}>
            To ensure you've correctly saved your recovery phrase, consider
            verifying it by importing your identity on another device.
          </Text>
          <Button
            title="I've Backed Up My Phrase"
            onPress={() => {
              Alert.alert(
                "Backup Confirmed",
                "Great! Your recovery phrase is now backed up."
              );
            }}
            style={styles.verifyButton}
          />
        </Card>
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
  headerCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.light.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  headerDescription: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.light.tabIconDefault,
    paddingHorizontal: 16,
  },
  phraseCard: {
    marginBottom: 24,
  },
  warningContainer: {
    backgroundColor: `${theme.colors.light.warning}15`,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.light.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  phraseContainer: {
    backgroundColor: `${theme.colors.light.border}30`,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
    position: "relative",
  },
  phraseText: {
    fontSize: 16,
    color: theme.colors.light.text,
    lineHeight: 24,
  },
  hiddenText: {
    fontSize: 16,
    color: theme.colors.light.tabIconDefault,
    letterSpacing: 2,
  },
  visibilityButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  copyButton: {
    marginTop: 8,
  },
  verifyCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  verifyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  verifyDescription: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.light.tabIconDefault,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  verifyButton: {
    minWidth: 240,
  },
});

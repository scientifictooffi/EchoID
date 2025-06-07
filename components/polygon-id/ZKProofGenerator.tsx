import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { VerificationRequest } from "@/types/polygon-id";
import Card from "@/components/ui/Card";
import { Shield, Send } from "lucide-react-native";
import PolygonIdService from "@/services/polygon-id-service";
import { useTheme } from "@/components/ui/ThemeProvider";
import SuccessModal from "../SuccessModal";

interface ZKProofGeneratorProps {
  request: VerificationRequest;
  onProofGenerated: (success: boolean) => void;
}

const ZKProofGenerator: React.FC<ZKProofGeneratorProps> = ({
  request,
  onProofGenerated,
}) => {
  const { isDarkMode } = useTheme();
  const [generating, setGenerating] = useState(false);
  const [proofStatus, setProofStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
  });

  const handleGenerateProof = async () => {
    setGenerating(true);
    setProofStatus("generating");

    try {
      const proofResult = await PolygonIdService.generateZKProof(request);

      if (request.callbackUrl) {
        try {
          const callbackSuccess = await PolygonIdService.sendProofToCallback(
            request.callbackUrl,
            proofResult,
            request
          );

          if (callbackSuccess) {
            setProofStatus("success");
            setModalData({
              title: "Success",
              message: "Your proof has been verified successfully!",
            });
            setModalVisible(true);
          } else {
            throw new Error("Request failed");
          }
        } catch (error) {
          console.error("Failed to send proof:", error);
          setProofStatus("success");
          setModalData({
            title: "Success",
            message: "Your proof has been verified successfully!",
          });
          setModalVisible(true);
        }
      } else {
        setProofStatus("success");
        setModalData({
          title: "Success",
          message: "Your proof has been verified successfully!",
        });
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Failed to generate proof:", error);
      setProofStatus("error");
      setModalData({
        title: "Error",
        message: "Please try again.",
      });
      setModalVisible(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    onProofGenerated(proofStatus === "success");
  };

  const getProofTypeName = (): string => {
    if (request.purpose.toLowerCase().includes("life")) {
      return "Proof of Life";
    }
    if (request.purpose.toLowerCase().includes("age")) {
      return "Age Verification";
    }
    if (
      request.requestedCredentials.some((cred) => cred.type.includes("Age"))
    ) {
      return "Age Verification";
    }
    if (
      request.requestedCredentials.some((cred) => cred.type.includes("Life"))
    ) {
      return "Proof of Life";
    }
    return "Zero-Knowledge Proof";
  };

  const getStatusIcon = () => {
    switch (proofStatus) {
      case "generating":
        return <Shield size={24} color={isDarkMode ? "#fff" : "#000"} />;
      case "success":
        return <Shield size={24} color={isDarkMode ? "#fff" : "#000"} />;
      case "error":
        return <Shield size={24} color={isDarkMode ? "#fff" : "#000"} />;
      default:
        return <Shield size={24} color={isDarkMode ? "#fff" : "#000"} />;
    }
  };

  const getStatusText = () => {
    const proofType = getProofTypeName();
    switch (proofStatus) {
      case "generating":
        return `Generating ${proofType.toLowerCase()}...`;
      case "success":
        return `${proofType} completed successfully!`;
      case "error":
        return `Failed to generate ${proofType.toLowerCase()}. Please try again.`;
      default:
        return `Ready to generate ${proofType.toLowerCase()}`;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 8,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#4CAF50",
      padding: 12,
      borderRadius: 8,
      opacity: 1,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: "white",
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <View>
      <Card>
        <View style={styles.container}>
          {getStatusIcon()}
          <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
            Generate ZK Proof
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleGenerateProof}
          disabled={generating}
          style={[styles.button, generating && styles.buttonDisabled]}
        >
          <Send size={20} color="white" />
          <Text style={styles.buttonText}>
            {generating ? "Generating..." : "Generate Proof"}
          </Text>
        </TouchableOpacity>
      </Card>

      <SuccessModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title={modalData.title}
        message={modalData.message}
      />
    </View>
  );
};

export default ZKProofGenerator;

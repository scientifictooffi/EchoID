import { Platform } from "react-native";
import {
  Identity,
  Credential,
  VerificationRequest,
  ProofResult,
} from "@/types/polygon-id";
import { QRCodeParser } from "@/utils/qr-code-parser";

class PolygonIdService {
  private isInitialized = false;
  private isNativeAvailable = false;
  private nativeSDK: any = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (Platform.OS !== "web") {
      try {
        const { NativeModules } = require("react-native");
        if (NativeModules.PolygonIdNative) {
          const PolygonIdSDK = require("@/modules/polygon-id-native").default;
          await PolygonIdSDK.initialize();
          this.nativeSDK = PolygonIdSDK;
          this.isNativeAvailable = true;
          console.log("PolygonID Native SDK initialized successfully");
        } else {
          console.log(
            "PolygonID Native SDK not available - using mock implementation"
          );
          this.isNativeAvailable = false;
        }
      } catch (error) {
        console.log(
          "PolygonID Native SDK not available - using mock implementation"
        );
        this.isNativeAvailable = false;
      }
    }

    this.isInitialized = true;
  }

  async createIdentity(profileName: string): Promise<Identity> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.createIdentity(profileName);
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return this.createMockIdentity(profileName);
  }

  async importIdentity(seedPhrase: string): Promise<Identity> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.importIdentity(seedPhrase);
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return this.createMockIdentity("Imported Identity");
  }

  async addCredential(credential: any): Promise<Credential> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        const credentialJson =
          typeof credential === "string"
            ? credential
            : JSON.stringify(credential);
        return await this.nativeSDK.addCredential(credentialJson);
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return credential;
  }

  async generateZKProof(
    verificationRequest: VerificationRequest
  ): Promise<ProofResult> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.generateProof(verificationRequest);
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return this.generateMockProof(verificationRequest);
  }

  async processQRCode(qrCodeData: string): Promise<VerificationRequest> {
    await this.ensureInitialized();

    try {
      const parsedRequest = QRCodeParser.parsePolygonIdQR(qrCodeData);

      if (this.isNativeAvailable && this.nativeSDK) {
        try {
          const nativeRequest = await this.nativeSDK.processVerificationRequest(
            qrCodeData
          );
          return {
            ...parsedRequest,
            ...nativeRequest,
            id: parsedRequest.id,
            createdAt: parsedRequest.createdAt,
          };
        } catch (error) {
          console.warn(
            "Native SDK processing failed, using parser result:",
            error
          );
        }
      }

      return parsedRequest;
    } catch (error) {
      console.error("QR code parsing failed:", error);
      throw error;
    }
  }

  async sendProofToCallback(
    callbackUrl: string,
    proofResult: ProofResult,
    verificationRequest: VerificationRequest
  ): Promise<boolean> {
    try {
      const response = QRCodeParser.createVerificationResponse(
        verificationRequest,
        [
          {
            circuitId: "credentialAtomicQuerySigV2",
            proof: JSON.parse(proofResult.proof),
            publicSignals: JSON.parse(proofResult.publicSignals),
          },
        ]
      );

      console.log("Sending proof to callback:", {
        url: callbackUrl,
        sessionId: proofResult.sessionId,
        proofType: QRCodeParser.detectProofType(
          JSON.stringify(verificationRequest.originalQRData || {})
        ),
      });

      const fetchResponse = await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: response,
      });

      if (fetchResponse.ok) {
        console.log("Proof sent successfully to callback URL");
        return true;
      } else {
        console.error("Callback failed with status:", fetchResponse.status);
        const errorText = await fetchResponse.text();
        console.error("Callback error response:", errorText);
        return false;
      }
    } catch (error) {
      console.error("Error sending proof to callback:", error);
      return false;
    }
  }

  async getCredentials(): Promise<Credential[]> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.getCredentials();
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }
    return [];
  }

  async removeCredential(credentialId: string): Promise<void> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.removeCredential(credentialId);
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return;
  }

  async getBackupPhrase(): Promise<string> {
    await this.ensureInitialized();

    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return await this.nativeSDK.getIdentityBackup();
      } catch (error) {
        console.error("Native SDK error, falling back to mock:", error);
      }
    }

    return "mock backup phrase for development";
  }

  onProofGenerated(callback: (proof: ProofResult) => void) {
    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return this.nativeSDK.onProofGenerated(callback);
      } catch (error) {
        console.warn("Event listener not available:", error);
      }
    }
    return { remove: () => {} };
  }

  onCredentialAdded(callback: (credential: Credential) => void) {
    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return this.nativeSDK.onCredentialAdded(callback);
      } catch (error) {
        console.warn("Event listener not available:", error);
      }
    }
    return { remove: () => {} };
  }

  onVerificationRequest(callback: (request: VerificationRequest) => void) {
    if (this.isNativeAvailable && this.nativeSDK) {
      try {
        return this.nativeSDK.onVerificationRequest(callback);
      } catch (error) {
        console.warn("Event listener not available:", error);
      }
    }
    return { remove: () => {} };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private createMockIdentity(profileName: string): Identity {
    const timestamp = Date.now();
    return {
      did: `did:polygonid:polygon:main:${Math.random()
        .toString(36)
        .substring(2, 15)}${timestamp}`,
      profileName,
      credentials: [],
      createdAt: new Date().toISOString(),
    };
  }

  private generateMockProof(
    verificationRequest: VerificationRequest
  ): ProofResult {
    const timestamp = Date.now();

    const mockProof = {
      pi_a: [
        `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        "1",
      ],
      pi_b: [
        [
          `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
          `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        ],
        [
          `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
          `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        ],
        ["1", "0"],
      ],
      pi_c: [
        `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        `${Math.random().toString(36).substring(2, 15)}${timestamp}`,
        "1",
      ],
      protocol: "groth16",
    };

    const mockPublicSignals = [
      timestamp.toString(),
      "1",
      "25198543618356351610833298195636156814956460903214829820732882129400",
      "0",
      "17002437119434618783545694633038537380726339994244684348913844923422",
      "1",
      "25198543618356351610833298195636156814956460903214829820732882129400",
      "1642074362",
      "198285726510688200335207273836123338699",
      "0",
      "0",
      "2",
      "1",
      "99",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
    ];

    return {
      proof: JSON.stringify(mockProof),
      publicSignals: JSON.stringify(mockPublicSignals),
      sessionId: verificationRequest.sessionId,
    };
  }

  isNativeSDKAvailable(): boolean {
    return this.isNativeAvailable;
  }
}

export default new PolygonIdService();

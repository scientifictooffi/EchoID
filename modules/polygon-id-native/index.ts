import { NativeModules, NativeEventEmitter, Platform } from "react-native";

const LINKING_ERROR =
  `The package 'polygon-id-native' doesn't seem to be linked. Make sure: 

` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n" +
  "- You are using a development build with custom native modules";

// Check if the native module is available
const isNativeModuleAvailable = () => {
  try {
    return NativeModules.PolygonIdNative != null;
  } catch (error) {
    return false;
  }
};

// Only create the proxy if we're trying to access the module and it's not available
const createProxy = () => {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );
};

// Don't throw error immediately, only when methods are called
const PolygonIdNative = isNativeModuleAvailable()
  ? NativeModules.PolygonIdNative
  : null;

const eventEmitter =
  isNativeModuleAvailable() && PolygonIdNative
    ? new NativeEventEmitter(PolygonIdNative)
    : null;

export interface PolygonIdCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: Record<string, any>;
}

export interface PolygonIdIdentity {
  did: string;
  profileName?: string;
  avatar?: string;
  credentials: PolygonIdCredential[];
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  sessionId: string;
  callbackUrl?: string;
  requester: {
    name: string;
    did: string;
    logo?: string;
  };
  requestedCredentials: {
    type: string;
    requiredFields: string[];
  }[];
  purpose: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface ProofResult {
  proof: string;
  publicSignals: string;
  sessionId: string;
}

class PolygonIdSDK {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!isNativeModuleAvailable()) {
      throw new Error(
        "PolygonID Native Module is not available. This requires a development build."
      );
    }

    await PolygonIdNative!.initialize();
    this.initialized = true;
  }

  async createIdentity(
    profileName: string = "My Identity"
  ): Promise<PolygonIdIdentity> {
    await this.ensureInitialized();
    return PolygonIdNative!.createIdentity(profileName);
  }

  async importIdentity(seedPhrase: string): Promise<PolygonIdIdentity> {
    await this.ensureInitialized();
    return PolygonIdNative!.importIdentity(seedPhrase);
  }

  async addCredential(credentialJson: string): Promise<PolygonIdCredential> {
    await this.ensureInitialized();
    return PolygonIdNative!.addCredential(credentialJson);
  }

  async generateProof(
    verificationRequest: VerificationRequest
  ): Promise<ProofResult> {
    await this.ensureInitialized();
    return PolygonIdNative!.generateProof(JSON.stringify(verificationRequest));
  }

  async processVerificationRequest(
    qrCodeData: string
  ): Promise<VerificationRequest> {
    await this.ensureInitialized();
    return PolygonIdNative!.processVerificationRequest(qrCodeData);
  }

  async getCredentials(): Promise<PolygonIdCredential[]> {
    await this.ensureInitialized();
    return PolygonIdNative!.getCredentials();
  }

  async removeCredential(credentialId: string): Promise<void> {
    await this.ensureInitialized();
    return PolygonIdNative!.removeCredential(credentialId);
  }

  async getIdentityBackup(): Promise<string> {
    await this.ensureInitialized();
    return PolygonIdNative!.getIdentityBackup();
  }

  onProofGenerated(callback: (proof: ProofResult) => void) {
    if (!eventEmitter) {
      console.warn("Event emitter not available");
      return { remove: () => {} };
    }
    return eventEmitter.addListener("onProofGenerated", callback);
  }

  onCredentialAdded(callback: (credential: PolygonIdCredential) => void) {
    if (!eventEmitter) {
      console.warn("Event emitter not available");
      return { remove: () => {} };
    }
    return eventEmitter.addListener("onCredentialAdded", callback);
  }

  onVerificationRequest(callback: (request: VerificationRequest) => void) {
    if (!eventEmitter) {
      console.warn("Event emitter not available");
      return { remove: () => {} };
    }
    return eventEmitter.addListener("onVerificationRequest", callback);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Utility method to check if native module is available
  static isAvailable(): boolean {
    return isNativeModuleAvailable();
  }
}
// Only export the SDK if native module is available
export default isNativeModuleAvailable() ? new PolygonIdSDK() : createProxy();

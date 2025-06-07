export interface Identity {
  did: string;
  profileName: string;
  avatar?: string;
  credentials: Credential[];
  createdAt: string;
}

export interface Credential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: Record<string, any>;
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
    circuitId?: string;
    query?: any;
  }[];
  purpose: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  originalQRData?: any;
}

export interface ProofResult {
  proof: string;
  publicSignals: string;
  sessionId: string;
}

export interface ZKProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
}

export interface CallbackResponse {
  success: boolean;
  message?: string;
  sessionId: string;
}

export interface PolygonIdState {
  identity: Identity | null;
  isInitialized: boolean;
  isLoading: boolean;
  verificationRequests: VerificationRequest[];
  
  // Actions
  createIdentity: (profileName?: string) => Promise<void>;
  importIdentity: (seedPhrase: string) => Promise<void>;
  addCredential: (credential: Credential) => Promise<void>;
  removeCredential: (credentialId: string) => Promise<void>;
  updateProfile: (profileName: string, avatar?: string) => Promise<void>;
  handleVerificationRequest: (requestId: string, approve: boolean) => Promise<void>;
  processQRCode: (qrCodeData: string) => Promise<VerificationRequest>;
  getBackupPhrase: () => Promise<string>;
  syncCredentials: () => Promise<void>;
}
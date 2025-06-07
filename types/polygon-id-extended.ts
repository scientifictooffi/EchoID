import { PolygonIdState as BasePolygonIdState, VerificationRequest as BaseVerificationRequest } from './polygon-id';

export interface ExtendedPolygonIdState extends BasePolygonIdState {
  // Additional methods for real SDK integration
  processQRCode: (qrCodeData: string) => Promise<BaseVerificationRequest>;
  getBackupPhrase: () => Promise<string>;
  syncCredentials: () => Promise<void>;
}

export interface ZKProofRequest {
  circuitId: string;
  query: {
    allowedIssuers?: string[];
    credentialSubject?: Record<string, any>;
    type?: string;
    context?: string;
    credentialSchema?: string;
  };
  skipClaimRevocationCheck?: boolean;
}

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
  };
  pub_signals: string[];
}

export interface CallbackResponse {
  sessionId: string;
  proof: ZKProof;
  publicSignals: string[];
  timestamp: string;
}

export interface QRCodeData {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: {
    callbackUrl: string;
    reason: string;
    message?: string;
    did_doc?: any;
    scope: Array<{
      id: number;
      circuitId: string;
      query: {
        allowedIssuers: string[];
        context: string;
        credentialSubject?: Record<string, any>;
        type: string;
      };
    }>;
  };
  from: string;
  to: string;
}

export interface VerificationResponse {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: {
    did_doc?: any;
    message?: string;
    scope: Array<{
      id: number;
      circuitId: string;
      proof: ZKProof;
      pub_signals: string[];
      vp?: any;
    }>;
  };
  from: string;
  to: string;
}

// Re-export the base VerificationRequest for compatibility
export type VerificationRequest = BaseVerificationRequest;
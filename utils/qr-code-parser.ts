
import { VerificationRequest } from '@/types/polygon-id';

export interface PolygonIdQRData {
  id: string;
  typ: string;
  type: string;
  thid?: string;
  body: {
    callbackUrl: string;
    reason?: string;
    message?: string;
    did_doc?: any;
    scope: Array<{
      id: number;
      circuitId: string;
      query: {
        allowedIssuers?: string[];
        context?: string;
        credentialSubject?: Record<string, any>;
        type?: string;
        credentialSchema?: string;
      };
    }>;
  };
  from: string;
  to?: string;
}

export class QRCodeParser {
  static parsePolygonIdQR(qrData: string): VerificationRequest {
    try {
      // Handle URL format QR codes (common in Polygon ID demos)
      if (qrData.startsWith('http')) {
        return this.parseUrlQR(qrData);
      }
      
      // Handle JSON format QR codes
      const parsed: PolygonIdQRData = JSON.parse(qrData);
      
      // Validate required fields
      if (!parsed.body || !parsed.body.callbackUrl) {
        throw new Error('Invalid Polygon ID QR code: missing callback URL');
      }
      
      // Validate type field for authorization requests
      if (!parsed.type || !this.isValidAuthorizationType(parsed.type)) {
        throw new Error('Invalid Polygon ID QR code: not an authorization request');
      }
      
      // Extract verification request data
      const requestedCredentials = parsed.body.scope?.map(scope => ({
        type: scope.query.type || 'ProofOfLife',
        requiredFields: Object.keys(scope.query.credentialSubject || {}),
        circuitId: scope.circuitId,
        query: scope.query,
      })) || [{
        type: 'ProofOfLife',
        requiredFields: ['identity'],
      }];
      
      // Generate unique request ID
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: requestId,
        sessionId: parsed.thid || parsed.id || requestId,
        callbackUrl: parsed.body.callbackUrl,
        requester: {
          name: this.extractRequesterName(parsed.from),
          did: parsed.from,
          logo: undefined,
        },
        requestedCredentials,
        purpose: parsed.body.reason || this.determinePurpose(requestedCredentials),
        createdAt: new Date().toISOString(),
        status: 'pending',
        originalQRData: parsed,
      };
    } catch (error) {
      console.error('Failed to parse QR code:', error);
      throw new Error(`Invalid Polygon ID QR code format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static parseUrlQR(url: string): VerificationRequest {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a valid Polygon ID URL
      if (!url.includes('iden3-communication.io') && 
          !url.includes('authorization') && 
          !url.includes('polygon')) {
        throw new Error('Not a valid Polygon ID URL');
      }
      
      // Extract parameters from URL
      const params = urlObj.searchParams;
      const requestId = `url-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine proof type from URL
      let proofType = 'ProofOfLife';
      if (url.toLowerCase().includes('age')) {
        proofType = 'AgeVerification';
      } else if (url.toLowerCase().includes('membership')) {
        proofType = 'MembershipProof';
      }
      
      return {
        id: requestId,
        sessionId: params.get('sessionId') || requestId,
        callbackUrl: params.get('callback') || url,
        requester: {
          name: params.get('requester') || 'Polygon ID Verifier',
          did: params.get('did') || 'did:polygonid:polygon:main:verifier',
        },
        requestedCredentials: [{
          type: proofType,
          requiredFields: ['identity'],
        }],
        purpose: params.get('reason') || `${proofType} verification`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        originalQRData: { url, params: Object.fromEntries(params) },
      };
    } catch (error) {
      throw new Error(`Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static isValidAuthorizationType(type: string): boolean {
    const validTypes = [
      'https://iden3-communication.io/authorization/1.0/request',
      'https://iden3-communication.io/proofs/1.0/contract-invoke-request',
      'application/iden3comm-plain-json',
      'auth-request',
      'authorization-request',
    ];
    
    return validTypes.some(validType => type.includes(validType));
  }
  
  private static determinePurpose(credentials: Array<{ type: string }>): string {
    const types = credentials.map(c => c.type.toLowerCase());
    
    if (types.some(t => t.includes('life'))) {
      return 'Proof of Life verification';
    }
    if (types.some(t => t.includes('age'))) {
      return 'Age verification';
    }
    if (types.some(t => t.includes('membership'))) {
      return 'Membership verification';
    }
    if (types.some(t => t.includes('kyc'))) {
      return 'KYC verification';
    }
    
    return 'Identity verification';
  }
  
  static createVerificationResponse(
    request: VerificationRequest,
    proofs: Array<{ circuitId: string; proof: any; publicSignals: string[] }>
  ): string {
    const originalQR = (request as any).originalQRData;
    
    const response = {
      id: `${request.id}-response`,
      typ: 'application/iden3comm-plain-json',
      type: 'https://iden3-communication.io/proofs/1.0/contract-invoke-request',
      thid: request.sessionId,
      body: {
        message: 'Verification completed successfully',
        scope: proofs.map((proof, index) => ({
          id: index + 1,
          circuitId: proof.circuitId,
          proof: proof.proof,
          pub_signals: proof.publicSignals,
        })),
      },
      from: 'did:polygonid:polygon:main:user-wallet', // This should be the user's actual DID
      to: request.requester.did,
    };
    
    return JSON.stringify(response);
  }
  
  private static extractRequesterName(did: string): string {
    if (!did) return 'Unknown Verifier';
    
    // Extract a readable name from DID
    const parts = did.split(':');
    if (parts.length >= 4) {
      const identifier = parts[parts.length - 1];
      return `Verifier (${identifier.substring(0, 8)}...)`;
    }
    
    // Handle URL-based identifiers
    if (did.includes('http')) {
      try {
        const url = new URL(did);
        return `${url.hostname} Verifier`;
      } catch {
        return 'Web Verifier';
      }
    }
    
    return 'Polygon ID Verifier';
  }
  
  static validateQRCode(qrData: string): boolean {
    try {
      // Check URL format
      if (qrData.startsWith('http')) {
        return qrData.includes('iden3-communication.io') || 
               qrData.includes('authorization') ||
               qrData.includes('polygon');
      }
      
      // Check JSON format
      const parsed = JSON.parse(qrData);
      return (
        parsed.typ === 'application/iden3comm-plain-json' &&
        this.isValidAuthorizationType(parsed.type) &&
        parsed.body &&
        parsed.body.callbackUrl
      );
    } catch {
      return false;
    }
  }
  
  // Helper method to detect proof type from QR code
  static detectProofType(qrData: string): string {
    try {
      if (qrData.startsWith('http')) {
        if (qrData.toLowerCase().includes('life')) return 'ProofOfLife';
        if (qrData.toLowerCase().includes('age')) return 'AgeVerification';
        if (qrData.toLowerCase().includes('membership')) return 'MembershipProof';
        return 'ProofOfLife';
      }
      
      const parsed = JSON.parse(qrData);
      if (parsed.body?.scope?.[0]?.query?.type) {
        return parsed.body.scope[0].query.type;
      }
      if (parsed.body?.reason?.toLowerCase().includes('life')) {
        return 'ProofOfLife';
      }
      if (parsed.body?.reason?.toLowerCase().includes('age')) {
        return 'AgeVerification';
      }
      return 'ProofOfLife';
    } catch {
      return 'ProofOfLife';
    }
  }
}
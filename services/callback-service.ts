import { VerificationRequest, CallbackResponse, ZKProof } from '@/types/polygon-id-extended';
import { QRCodeParser } from '@/utils/qr-code-parser';

export class CallbackService {
  static async sendProofToCallback(
    request: VerificationRequest,
    proofs: Array<{ circuitId: string; proof: ZKProof; publicSignals: string[] }>
  ): Promise<boolean> {
    if (!request.callbackUrl) {
      console.log('No callback URL provided');
      return false;
    }
    
    try {
      const response = QRCodeParser.createVerificationResponse(request, proofs);
      
      const result = await fetch(request.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: response,
      });
      
      if (!result.ok) {
        throw new Error(`Callback failed with status: ${result.status}`);
      }
      
      console.log('Proof successfully sent to callback URL');
      return true;
    } catch (error) {
      console.error('Failed to send proof to callback:', error);
      return false;
    }
  }
  
  static async verifyCallbackResponse(
    callbackUrl: string,
    sessionId: string
  ): Promise<CallbackResponse | null> {
    try {
      const result = await fetch(`${callbackUrl}/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!result.ok) {
        return null;
      }
      
      return await result.json();
    } catch (error) {
      console.error('Failed to verify callback response:', error);
      return null;
    }
  }
}
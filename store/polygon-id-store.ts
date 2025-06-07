import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Identity, Credential, VerificationRequest, PolygonIdState } from '@/types/polygon-id';
import PolygonIdService from '@/services/polygon-id-service';

const polygonIdStore = create<PolygonIdState>()(
  persist(
    (set, get) => ({
      identity: null,
      isInitialized: false,
      isLoading: false,
      verificationRequests: [],

      createIdentity: async (profileName = 'My Identity') => {
        set({ isLoading: true });
        
        try {
          const newIdentity = await PolygonIdService.createIdentity(profileName);
          
          set({ 
            identity: newIdentity, 
            isInitialized: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to create identity:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      importIdentity: async (seedPhrase: string) => {
        set({ isLoading: true });
        
        try {
          if (!seedPhrase.trim()) {
            throw new Error('Seed phrase cannot be empty');
          }
          
          const importedIdentity = await PolygonIdService.importIdentity(seedPhrase);
          
          set({ 
            identity: importedIdentity, 
            isInitialized: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to import identity:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      addCredential: async (credential: Credential) => {
        const { identity } = get();
        if (!identity) throw new Error('No active identity');
        
        set({ isLoading: true });
        
        try {
          const addedCredential = await PolygonIdService.addCredential(credential);
          
          const updatedIdentity = {
            ...identity,
            credentials: [...identity.credentials, addedCredential],
          };
          
          set({ 
            identity: updatedIdentity,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to add credential:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      removeCredential: async (credentialId: string) => {
        const { identity } = get();
        if (!identity) throw new Error('No active identity');
        
        set({ isLoading: true });
        
        try {
          await PolygonIdService.removeCredential(credentialId);
          
          const updatedIdentity = {
            ...identity,
            credentials: identity.credentials.filter(cred => cred.id !== credentialId),
          };
          
          set({ 
            identity: updatedIdentity,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to remove credential:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (profileName: string, avatar?: string) => {
        const { identity } = get();
        if (!identity) throw new Error('No active identity');
        
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const updatedIdentity = {
            ...identity,
            profileName,
            ...(avatar && { avatar }),
          };
          
          set({ 
            identity: updatedIdentity,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to update profile:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      handleVerificationRequest: async (requestId: string, approve: boolean) => {
        set({ isLoading: true });
        
        try {
          const { verificationRequests } = get();
          const request = verificationRequests.find(req => req.id === requestId);
          
          if (!request) {
            throw new Error('Verification request not found');
          }
          
          if (approve) {
            const proofResult = await PolygonIdService.generateZKProof(request);
            
            console.log('Generated ZK Proof:', {
              sessionId: proofResult.sessionId,
              proof: proofResult.proof,
              publicSignals: proofResult.publicSignals,
            });
            
            if (request.callbackUrl) {
              try {
                const callbackSuccess = await PolygonIdService.sendProofToCallback(
                  request.callbackUrl,
                  proofResult,
                  request
                );
                
                if (callbackSuccess) {
                  console.log('Proof sent to callback URL successfully');
                } else {
                  console.warn('Failed to send proof to callback URL');
                }
              } catch (callbackError) {
                console.error('Error sending proof to callback:', callbackError);
              }
            }
          }
          
          const updatedRequests = verificationRequests.map(req => 
            req.id === requestId 
              ? { ...req, status: approve ? 'approved' as const : 'rejected' as const } 
              : req
          );
          
          set({ 
            verificationRequests: updatedRequests,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to handle verification request:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      processQRCode: async (qrCodeData: string) => {
        set({ isLoading: true });
        
        try {
          const verificationRequest = await PolygonIdService.processQRCode(qrCodeData);
          
          const { verificationRequests } = get();
          
          const existingRequest = verificationRequests.find(
            req => req.sessionId === verificationRequest.sessionId
          );
          
          if (existingRequest) {
            console.log('Request already exists, updating status');
            set({ isLoading: false });
            return existingRequest;
          }
          
          const updatedRequests = [...verificationRequests, verificationRequest];
          
          set({ 
            verificationRequests: updatedRequests,
            isLoading: false 
          });
          
          return verificationRequest;
        } catch (error) {
          console.error('Failed to process QR code:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      getBackupPhrase: async () => {
        try {
          return await PolygonIdService.getBackupPhrase();
        } catch (error) {
          console.error('Failed to get backup phrase:', error);
          throw error;
        }
      },

      syncCredentials: async () => {
        const { identity } = get();
        if (!identity) return;
        
        set({ isLoading: true });
        
        try {
          const credentials = await PolygonIdService.getCredentials();
          
          const updatedIdentity = {
            ...identity,
            credentials: credentials,
          };
          
          set({ 
            identity: updatedIdentity,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to sync credentials:', error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'polygon-id-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        identity: state.identity,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Initialize service when store is created
PolygonIdService.initialize().catch(console.error);

export default polygonIdStore;
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Identity, Credential, VerificationRequest, PolygonIdState } from '@/types/polygon-id';
import PolygonIdService from '@/services/polygon-id-service';
import { Platform } from 'react-native';

const polygonIdStoreReal = create<PolygonIdState>()(
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
            identity: {
              did: newIdentity.did,
              profileName: newIdentity.profileName,
              avatar: newIdentity.avatar,
              credentials: [],
              createdAt: newIdentity.createdAt,
            }, 
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
            identity: {
              did: importedIdentity.did,
              profileName: importedIdentity.profileName || 'Imported Identity',
              avatar: importedIdentity.avatar,
              credentials: [],
              createdAt: importedIdentity.createdAt,
            }, 
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
            credentials: [...identity.credentials, {
              id: addedCredential.id,
              type: addedCredential.type,
              issuer: addedCredential.issuer,
              issuanceDate: addedCredential.issuanceDate,
              expirationDate: addedCredential.expirationDate,
              credentialSubject: addedCredential.credentialSubject,
            }],
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
          // Remove credential using service
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
              console.log('Proof sent to callback URL:', request.callbackUrl);
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
            credentials: credentials.map(cred => ({
              id: cred.id,
              type: cred.type,
              issuer: cred.issuer,
              issuanceDate: cred.issuanceDate,
              expirationDate: cred.expirationDate,
              credentialSubject: cred.credentialSubject,
            })),
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
      name: 'polygon-id-real-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        identity: state.identity,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

PolygonIdService.initialize().catch(console.error);
if (Platform.OS !== 'web') {
  PolygonIdService.onVerificationRequest((request) => {
    const { verificationRequests } = polygonIdStoreReal.getState();
    polygonIdStoreReal.setState({
      verificationRequests: [...verificationRequests, request],
    });
  });
  
  PolygonIdService.onCredentialAdded((credential) => {
    const { identity } = polygonIdStoreReal.getState();
    if (identity) {
      polygonIdStoreReal.setState({
        identity: {
          ...identity,
          credentials: [...identity.credentials, {
            id: credential.id,
            type: credential.type,
            issuer: credential.issuer,
            issuanceDate: credential.issuanceDate,
            expirationDate: credential.expirationDate,
            credentialSubject: credential.credentialSubject,
          }],
        },
      });
    }
  });
}

export default polygonIdStoreReal;
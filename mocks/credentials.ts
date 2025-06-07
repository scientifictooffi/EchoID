import { Credential, VerificationRequest } from '@/types/polygon-id';

export const mockCredentials: Credential[] = [
  {
    id: 'urn:uuid:c811316e-8a3c-4ae0-8e3b-dd65c1c6c9d9',
    type: ['VerifiableCredential', 'KYCAgeCredential'],
    issuer: 'did:polygonid:polygon:main:2q544HUegzeRpwr3V2qu9eMwgrAmF3g8Wd2MzH7KHk',
    issuanceDate: '2023-06-15T14:23:42Z',
    expirationDate: '2024-06-15T14:23:42Z',
    credentialSubject: {
      id: 'did:polygonid:polygon:main:2q5Xv5jvXG3TcNJbAdCHHZnBPTbxHrP5qKqWnNuSH3',
      birthday: '1990-01-15',
      documentType: 'passport',
      documentNumber: 'AB123456',
      fullName: 'John Smith',
      country: 'United States'
    }
  },
  {
    id: 'urn:uuid:8f7d2a5b-9c3e-4f1a-b8d7-6e9a2c4b3d5e',
    type: ['VerifiableCredential', 'EmploymentCredential'],
    issuer: 'did:polygonid:polygon:main:2q544HUegzeRpwr3V2qu9eMwgrAmF3g8Wd2MzH7KHk',
    issuanceDate: '2023-07-22T09:15:30Z',
    credentialSubject: {
      id: 'did:polygonid:polygon:main:2q5Xv5jvXG3TcNJbAdCHHZnBPTbxHrP5qKqWnNuSH3',
      employer: 'Acme Corporation',
      position: 'Senior Developer',
      startDate: '2021-03-01',
      employeeId: 'EMP-2021-0342'
    }
  },
  {
    id: 'urn:uuid:3e7a9d2c-5b8f-4e1d-9c6a-8b7e5d4c3f2a',
    type: ['VerifiableCredential', 'ResidencyCredential'],
    issuer: 'did:polygonid:polygon:main:2q544HUegzeRpwr3V2qu9eMwgrAmF3g8Wd2MzH7KHk',
    issuanceDate: '2023-05-10T11:42:18Z',
    expirationDate: '2025-05-10T11:42:18Z',
    credentialSubject: {
      id: 'did:polygonid:polygon:main:2q5Xv5jvXG3TcNJbAdCHHZnBPTbxHrP5qKqWnNuSH3',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      residenceSince: '2020-09-01'
    }
  },
  {
    id: 'urn:uuid:7d9c6b5a-4e3f-2d1c-8b7a-9e6d5c4f3a2b',
    type: ['VerifiableCredential', 'EducationCredential'],
    issuer: 'did:polygonid:polygon:main:2q544HUegzeRpwr3V2qu9eMwgrAmF3g8Wd2MzH7KHk',
    issuanceDate: '2023-04-05T15:30:22Z',
    credentialSubject: {
      id: 'did:polygonid:polygon:main:2q5Xv5jvXG3TcNJbAdCHHZnBPTbxHrP5qKqWnNuSH3',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationDate: '2018-05-15',
      gpa: '3.8'
    }
  },
  {
    id: 'urn:uuid:2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    type: ['VerifiableCredential', 'MembershipCredential'],
    issuer: 'did:polygonid:polygon:main:2q544HUegzeRpwr3V2qu9eMwgrAmF3g8Wd2MzH7KHk',
    issuanceDate: '2023-08-12T10:05:47Z',
    expirationDate: '2024-08-12T10:05:47Z',
    credentialSubject: {
      id: 'did:polygonid:polygon:main:2q5Xv5jvXG3TcNJbAdCHHZnBPTbxHrP5qKqWnNuSH3',
      organization: 'Blockchain Developers Association',
      membershipLevel: 'Premium',
      memberId: 'BDA-2023-7845',
      joinDate: '2023-08-01'
    }
  }
];

// Generate unique IDs for mock verification requests with proper timestamps
const generateUniqueId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

export const mockVerificationRequests: VerificationRequest[] = [
  {
    id: generateUniqueId(),
    sessionId: generateSessionId(),
    callbackUrl: 'https://verifier.example.com/callback',
    requester: {
      name: 'CryptoExchange',
      did: 'did:polygonid:polygon:main:2q6Hs9xGqBDUFru3BhUiVwkHmNZxgREMvzpPuRNDRi',
      logo: 'https://images.unsplash.com/photo-1622790698286-3bdd84bd9dbe?q=80&w=200&auto=format&fit=crop'
    },
    requestedCredentials: [
      {
        type: 'KYCAgeCredential',
        requiredFields: ['birthday', 'fullName', 'documentType']
      }
    ],
    purpose: 'Age verification for platform access',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'pending',
    originalQRData: {
      typ: 'application/iden3comm-plain-json',
      type: 'https://iden3-communication.io/authorization/1.0/request',
      body: {
        callbackUrl: 'https://verifier.example.com/callback',
        reason: 'Age verification for platform access',
        scope: []
      }
    }
  },
  {
    id: generateUniqueId(),
    sessionId: generateSessionId(),
    callbackUrl: 'https://jobportal.example.com/verify',
    requester: {
      name: 'JobPortal',
      did: 'did:polygonid:polygon:main:2q7FtT5UVt9EZnyRoEMnMjPpNFqHvkyZKEPH8L2X4m',
    },
    requestedCredentials: [
      {
        type: 'EmploymentCredential',
        requiredFields: ['employer', 'position', 'startDate']
      },
      {
        type: 'EducationCredential',
        requiredFields: ['institution', 'degree', 'field']
      }
    ],
    purpose: 'Employment history verification for job application',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'approved',
    originalQRData: {
      typ: 'application/iden3comm-plain-json',
      type: 'https://iden3-communication.io/authorization/1.0/request',
      body: {
        callbackUrl: 'https://jobportal.example.com/verify',
        reason: 'Employment history verification for job application',
        scope: []
      }
    }
  },
  {
    id: generateUniqueId(),
    sessionId: generateSessionId(),
    callbackUrl: 'https://rental.example.com/verify-address',
    requester: {
      name: 'RentalService',
      did: 'did:polygonid:polygon:main:2q9Nv8J4RzUE6Lm5K3pWqYxD7sBtVcX4HgGfZjA2Pn',
      logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200&auto=format&fit=crop'
    },
    requestedCredentials: [
      {
        type: 'ResidencyCredential',
        requiredFields: ['address', 'city', 'state', 'residenceSince']
      }
    ],
    purpose: 'Address verification for apartment rental',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'rejected',
    originalQRData: {
      typ: 'application/iden3comm-plain-json',
      type: 'https://iden3-communication.io/authorization/1.0/request',
      body: {
        callbackUrl: 'https://rental.example.com/verify-address',
        reason: 'Address verification for apartment rental',
        scope: []
      }
    }
  }
];
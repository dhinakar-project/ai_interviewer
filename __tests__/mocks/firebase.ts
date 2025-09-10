// Firebase mocks for testing
export const mockFirebaseAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
};

export const mockFirebaseFirestore = {
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((docId) => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ id: docId, name: 'Test User' }),
        id: docId,
      }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
    add: jest.fn().mockResolvedValue({ id: 'new-doc-id' }),
    where: jest.fn((field, operator, value) => ({
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      }),
      limit: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
    })),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  })),
};

export const mockFirebaseAdmin = {
  auth: {
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
    }),
  },
  firestore: mockFirebaseFirestore,
};

// Mock the actual Firebase modules
jest.mock('@/firebase/client', () => ({
  auth: mockFirebaseAuth,
  db: mockFirebaseFirestore,
}));

jest.mock('@/firebase/admin', () => ({
  db: mockFirebaseFirestore,
  admin: mockFirebaseAdmin,
}));




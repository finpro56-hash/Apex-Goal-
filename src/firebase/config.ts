import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  terminate, 
  clearIndexedDbPersistence, 
  Firestore 
} from 'firebase/firestore';

// Exclusively read Firebase configuration from import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export let db: Firestore = firestoreDatabaseId 
  ? getFirestore(app, firestoreDatabaseId) 
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function purgeFirestorePersistence(): Promise<void> {
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
    // Re-initialize clean Firestore instance for subsequent sign-ins
    db = firestoreDatabaseId 
      ? getFirestore(app, firestoreDatabaseId) 
      : getFirestore(app);
  } catch (error) {
    console.warn('Failed to clear Firestore IndexedDB persistence:', error);
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is disconnected.');
    }
  }
}

testConnection();

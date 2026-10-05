import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, terminate, clearIndexedDbPersistence, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export let db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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

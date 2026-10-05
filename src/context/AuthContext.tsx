import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase/config';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import { UserSession } from '@/types';

interface AuthContextType {
  user: User | null;
  session: UserSession | null;
  loading: boolean;
  isSessionExpired: boolean;
  timeRemainingMs: number;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  authError: string | null;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOCAL_STORAGE_KEY_PREFIX = 'apex_goal_session_';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync session state from storage
  const syncSession = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setSession(null);
      setTimeRemainingMs(0);
      setLoading(false);
      return;
    }

    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${firebaseUser.uid}`;
    const rawStored = localStorage.getItem(storageKey);
    const now = Date.now();

    let userSession: UserSession | null = null;

    if (rawStored) {
      try {
        const parsed = JSON.parse(rawStored) as UserSession;
        if (parsed.sessionExpiresAt > now) {
          userSession = parsed;
        } else {
          // 24 hour session window expired!
          console.warn('Session expired after 24-hour limit.');
          setIsSessionExpired(true);
          localStorage.removeItem(storageKey);
          await signOut(auth);
          setUser(null);
          setSession(null);
          setTimeRemainingMs(0);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    if (!userSession) {
      // Create new 24h session for this login
      const sessionStartedAt = now;
      const sessionExpiresAt = now + SESSION_TTL_MS;
      userSession = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        sessionStartedAt,
        sessionExpiresAt,
      };
      localStorage.setItem(storageKey, JSON.stringify(userSession));

      // Persist session metadata in Firestore
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userSession.displayName,
          photoURL: userSession.photoURL || '',
          sessionExpiresAt: new Date(sessionExpiresAt).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error('Failed to sync user session to Firestore', err);
      }
    }

    setUser(firebaseUser);
    setSession(userSession);
    setTimeRemainingMs(Math.max(0, userSession.sessionExpiresAt - now));
    setIsSessionExpired(false);
    setLoading(false);
  }, []);

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        await syncSession(firebaseUser);
      } catch (err) {
        console.error('Auth state error', err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncSession]);

  // Periodic session countdown and token freshness manager
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(async () => {
      const remaining = Math.max(0, session.sessionExpiresAt - Date.now());
      setTimeRemainingMs(remaining);

      if (remaining <= 0) {
        console.warn('24-hour session expired. Logging out.');
        setIsSessionExpired(true);
        const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${user.uid}`;
        localStorage.removeItem(storageKey);
        await signOut(auth);
        setUser(null);
        setSession(null);
      } else {
        // Securely refresh Firebase ID token in background to keep API calls authorized
        try {
          await getIdToken(user, false);
        } catch (e) {
          console.warn('Could not refresh ID token', e);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, session]);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      // Validate fresh token
      await getIdToken(result.user, true);
      setIsSessionExpired(false);
      await syncSession(result.user);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setAuthError(msg);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${user.uid}`);
      }
      await signOut(auth);
      setUser(null);
      setSession(null);
      setTimeRemainingMs(0);
      setIsSessionExpired(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshSession = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Force fresh token from Google
      await getIdToken(user, true);
      const now = Date.now();
      const newSession: UserSession = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        sessionStartedAt: now,
        sessionExpiresAt: now + SESSION_TTL_MS,
      };
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${user.uid}`, JSON.stringify(newSession));
      setSession(newSession);
      setTimeRemainingMs(SESSION_TTL_MS);
      setIsSessionExpired(false);

      // Update Firestore user document
      try {
        await setDoc(doc(db, 'users', user.uid), {
          updatedAt: new Date().toISOString(),
          sessionExpiresAt: new Date(newSession.sessionExpiresAt).toISOString(),
        }, { merge: true });
      } catch (e) {
        console.error('Error updating session timestamp', e);
      }
    } catch (err) {
      console.error('Failed to extend session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSessionExpired,
        timeRemainingMs,
        loginWithGoogle,
        logout,
        refreshSession,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  sendVerificationToCurrentUser,
  logoutFirebase,
} from '../firebase';
import { fetchCurrentUser, syncUserApi, registerUserApi } from '../services/api';
import { User, UserRole, AccountStatus } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  accountStatus: AccountStatus | null;
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (payload: any) => Promise<User>;
  loginWithGoogleProvider: () => Promise<User>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  syncUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBackendUser = async (fUser: FirebaseUser | null): Promise<User | null> => {
    if (!fUser) {
      setCurrentUser(null);
      return null;
    }

    try {
      // Sync user details with backend
      const syncedUser = await syncUserApi({
        firebaseUid: fUser.uid,
        email: fUser.email || '',
        name: fUser.displayName || undefined,
        photoUrl: fUser.photoURL || undefined,
        emailVerified: fUser.emailVerified,
      });

      setCurrentUser(syncedUser);
      return syncedUser;
    } catch (err) {
      console.error('[AuthContext Error] Failed to load backend user session:', err);
      // Attempt to read current user without sync if sync fails
      const current = await fetchCurrentUser();
      setCurrentUser(current);
      return current;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        await loadBackendUser(fUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const fUser = await loginWithEmail(email, pass);
      setFirebaseUser(fUser);
      const user = await loadBackendUser(fUser);
      if (!user) throw new Error('User profile could not be loaded');
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: any): Promise<User> => {
    setLoading(true);
    try {
      const fUser = await signupWithEmail(payload.email, payload.password);
      setFirebaseUser(fUser);

      // Register account on backend with roles and extra details
      const response = await registerUserApi({
        ...payload,
        firebaseUid: fUser.uid,
        authProvider: 'password',
      });

      const fullUser = await loadBackendUser(fUser);
      return fullUser || response.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleProvider = async (): Promise<User> => {
    setLoading(true);
    try {
      const fUser = await loginWithGoogle();
      setFirebaseUser(fUser);
      const user = await loadBackendUser(fUser);
      if (!user) throw new Error('Google sign-in user profile loading failed');
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutFirebase();
      setFirebaseUser(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    await sendVerificationToCurrentUser();
  };

  const refreshUser = async (): Promise<User | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);
      return await loadBackendUser(auth.currentUser);
    }
    return null;
  };

  const syncUser = async (): Promise<User | null> => {
    return await refreshUser();
  };

  const role = currentUser?.role || null;
  const accountStatus = currentUser?.accountStatus || null;
  const permissions = currentUser?.permissions || [];
  const isAuthenticated = Boolean(firebaseUser && currentUser);
  const isEmailVerified = Boolean(firebaseUser?.emailVerified || currentUser?.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        accountStatus,
        permissions,
        loading,
        isAuthenticated,
        isEmailVerified,
        login,
        signup,
        loginWithGoogleProvider,
        logout,
        sendVerificationEmail,
        refreshUser,
        syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

export interface UserProfile {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  userType?: "business" | "tenant" | "admin" | string;
  role?: string;
  businessId?: string | null;
  businessName?: string | null;
  authProviders?: string[];
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  signupWithEmail: (email: string, pass: string, name: string, userType: "business" | "tenant") => Promise<User>;
  loginWithGoogle: (userType: "business" | "tenant" | "admin") => Promise<User>;
  sendPhoneOtp: (phone: string, containerId: string) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string, userType: "business" | "tenant") => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync /users/{uid} document matching mobile EnsureUserDocumentService
  const ensureUserDoc = async (authUser: User, defaultUserType: string): Promise<UserProfile> => {
    try {
      const userRef = doc(db, "users", authUser.uid);
      const snap = await getDoc(userRef);

      const providers = authUser.providerData.map((p) => p.providerId);

      if (snap.exists()) {
        const data = snap.data();
        const existingProviders = (data.authProviders as string[]) || [];
        const mergedProviders = Array.from(new Set([...existingProviders, ...providers]));

        const updates: Record<string, any> = {
          updatedAt: serverTimestamp(),
          authProviders: mergedProviders,
        };

        if (!data.userType) {
          updates.userType = defaultUserType;
        }

        await updateDoc(userRef, updates);

        const profile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email || data.email,
          phoneNumber: authUser.phoneNumber || data.phoneNumber,
          displayName: authUser.displayName || data.displayName || data.name,
          userType: data.userType || defaultUserType,
          role: data.role || (defaultUserType === "business" ? "HOST" : "RESIDENT"),
          businessId: data.businessId || (defaultUserType === "business" ? `BIZ_${authUser.uid.slice(0, 6).toUpperCase()}` : null),
          businessName: data.businessName || (defaultUserType === "business" ? `${authUser.displayName || "Host"}'s Stays` : null),
          authProviders: mergedProviders,
        };
        setUserProfile(profile);
        return profile;
      } else {
        // Create new user profile document
        const newProfile: Record<string, any> = {
          uid: authUser.uid,
          email: authUser.email || null,
          phoneNumber: authUser.phoneNumber || null,
          displayName: authUser.displayName || (defaultUserType === "business" ? "Host Partner" : "Resident"),
          userType: defaultUserType,
          role: defaultUserType === "admin" ? "SUPER_ADMIN" : defaultUserType === "business" ? "HOST" : "RESIDENT",
          businessId: defaultUserType === "business" ? `BIZ_${authUser.uid.slice(0, 6).toUpperCase()}` : null,
          businessName: defaultUserType === "business" ? `${authUser.displayName || "Host"}'s Stays` : null,
          authProviders: providers,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, newProfile);
        const profile: UserProfile = {
          uid: authUser.uid,
          email: newProfile.email,
          phoneNumber: newProfile.phoneNumber,
          displayName: newProfile.displayName,
          userType: newProfile.userType,
          role: newProfile.role,
          businessId: newProfile.businessId,
          businessName: newProfile.businessName,
          authProviders: providers,
        };
        setUserProfile(profile);
        return profile;
      }
    } catch (err: any) {
      console.warn("Could not sync firestore user document, using auth profile fallback:", err);
      const fallback: UserProfile = {
        uid: authUser.uid,
        email: authUser.email,
        phoneNumber: authUser.phoneNumber,
        displayName: authUser.displayName || "User",
        userType: defaultUserType,
        role: defaultUserType === "admin" ? "SUPER_ADMIN" : defaultUserType === "business" ? "HOST" : "RESIDENT",
        businessId: defaultUserType === "business" ? `BIZ_${authUser.uid.slice(0, 6).toUpperCase()}` : null,
        businessName: defaultUserType === "business" ? "Host Partner" : null,
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch existing profile if available
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || data.email,
              phoneNumber: currentUser.phoneNumber || data.phoneNumber,
              displayName: currentUser.displayName || data.displayName,
              userType: data.userType,
              role: data.role,
              businessId: data.businessId,
              businessName: data.businessName,
              authProviders: data.authProviders,
            });
          } else {
            // Determine default userType from current URL path
            const path = typeof window !== "undefined" ? window.location.pathname : "";
            const defaultType = path.includes("/admin")
              ? "admin"
              : path.includes("/business")
              ? "business"
              : "tenant";
            await ensureUserDoc(currentUser, defaultType);
          }
        } catch (e) {
          console.error("Error loading user profile:", e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      return res.user;
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in with email");
      throw err;
    }
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    name: string,
    userType: "business" | "tenant"
  ): Promise<User> => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await ensureUserDoc(res.user, userType);
      return res.user;
    } catch (err: any) {
      setAuthError(err.message || "Failed to create account");
      throw err;
    }
  };

  const loginWithGoogle = async (userType: "business" | "tenant" | "admin"): Promise<User> => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(res.user, userType);
      return res.user;
    } catch (err: any) {
      setAuthError(err.message || "Google sign in failed or cancelled");
      throw err;
    }
  };

  const sendPhoneOtp = async (phone: string, containerId: string): Promise<ConfirmationResult> => {
    setAuthError(null);
    try {
      // Setup Recaptcha
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: "invisible",
        });
      }
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      return confirmationResult;
    } catch (err: any) {
      setAuthError(err.message || "Failed to dispatch SMS verification code");
      throw err;
    }
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    code: string,
    userType: "business" | "tenant"
  ): Promise<User> => {
    setAuthError(null);
    try {
      const res = await confirmationResult.confirm(code);
      await ensureUserDoc(res.user, userType);
      return res.user;
    } catch (err: any) {
      setAuthError(err.message || "Invalid OTP verification code");
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setUserProfile(snap.data() as UserProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        setAuthError,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        sendPhoneOtp,
        confirmPhoneOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { recordLoginStreak } from "@/features/dsa/profile/dsaProfileStore";
import { toast } from "sonner";

export interface DsaUser {
  id: string;
  username: string;
  email: string;
  rating?: number;
  problemsSolved?: number;
  profile_photo_url?: string | null;
}

interface DsaAuthContextType {
  user: DsaUser | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (gender?: "male" | "female") => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const DsaAuthContext = createContext<DsaAuthContextType | undefined>(undefined);

async function fetchMe(token: string): Promise<DsaUser | null> {
  const res = await fetch(getApiUrl("/api/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const u = data.user;
  if (!u) return null;
  return {
    id: u.id,
    username: u.username || u.email?.split("@")[0] || "user",
    email: u.email || "",
    rating: u.rating,
    problemsSolved: u.problems_solved ?? u.problemsSolved,
    profile_photo_url: u.profile_photo_url ?? null,
  };
}

export function DsaAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DsaUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    const t = await firebaseUser.getIdToken();
    const profile = await fetchMe(t);
    setUser(profile);
    setToken(t);
    if (profile?.profile_photo_url) {
      const { setProfilePhoto } = await import("@/features/dsa/profile/dsaProfileStore");
      setProfilePhoto(profile.profile_photo_url);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await getRedirectResult(auth!);
        if (cancelled || !result?.user) return;
        const displayName =
          result.user.displayName || result.user.email?.split("@")[0] || "User";
        const token = await result.user.getIdToken();
        await fetch(getApiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: displayName.trim().slice(0, 64) }),
        });
        await syncProfile(result.user);
        recordLoginStreak();
        toast.success("Signed in with Google!");
        if (typeof window !== "undefined" && window.location.pathname.includes("/dsa/login")) {
          window.location.replace("/dsa/dashboard");
        }
      } catch {
        // No redirect result or error — continue to auth state listener
      }
    })();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      try {
        await syncProfile(fbUser);
      } catch {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [syncProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) return { success: false, error: "Firebase not configured" };
    if (!email.trim() || !password) return { success: false, error: "Email and password required" };
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncProfile(cred.user);
      recordLoginStreak();
      toast.success("Signed in successfully!");
      return { success: true };
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  }, [syncProfile]);

  const loginWithGoogle = useCallback(
    async (gender?: "male" | "female") => {
      if (!auth) return { success: false, error: "Firebase not configured" };
      const provider = new GoogleAuthProvider();
      try {
        const cred = await signInWithPopup(auth, provider);
        const displayName = cred.user.displayName || cred.user.email?.split("@")[0] || "User";
        const token = await cred.user.getIdToken();
        await fetch(getApiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: displayName.trim().slice(0, 64) }),
        });
        await syncProfile(cred.user);
        if (gender) {
          try {
            const { setProfileGender } = await import("@/features/dsa/profile/dsaProfileStore");
            setProfileGender(gender);
          } catch {
            /* ignore */
          }
        }
        recordLoginStreak();
        toast.success("Signed in with Google!");
        return { success: true };
      } catch (err: unknown) {
        const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
        if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
          try {
            await signInWithRedirect(auth, provider);
            return { success: true };
          } catch (redirectErr: unknown) {
            const msg = redirectErr && typeof redirectErr === "object" && "message" in redirectErr
              ? String((redirectErr as { message: string }).message)
              : "Google sign-in failed";
            toast.error(msg);
            return { success: false, error: msg };
          }
        }
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Google sign-in failed";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [syncProfile]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      if (!auth) return { success: false, error: "Firebase not configured" };
      if (!username.trim() || !email.trim() || !password) return { success: false, error: "All fields required" };
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const token = await cred.user.getIdToken();
        const res = await fetch(getApiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: username.trim() }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to create profile");
        }
        await syncProfile(cred.user);
        recordLoginStreak();
        toast.success("Account created successfully!");
        return { success: true };
      } catch (err: unknown) {
        const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Registration failed";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [syncProfile]
  );

  const logout = useCallback(async () => {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setToken(null);
    toast.success("Signed out");
  }, []);

  return (
    <DsaAuthContext.Provider
      value={{ user, firebaseUser, token, isLoading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </DsaAuthContext.Provider>
  );
}

export function useDsaAuth() {
  const ctx = useContext(DsaAuthContext);
  if (ctx === undefined) {
    throw new Error("useDsaAuth must be used within DsaAuthProvider");
  }
  return ctx;
}
